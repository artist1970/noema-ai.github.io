const DEFAULT_CONFIG = Object.freeze({
  enabled: false,
  baseUrl: "",
  apiPrefix: "/api/v1",
  timeoutMs: 12000,
  credentialsMode: "include",
  expectedHealthPath: "/health"
});

function isLocalhost(hostname = "") {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

export function normalizeServerConfig(input = {}) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...(input || {})
  };

  const enabled = merged.enabled === true;
  const rawBase = String(merged.baseUrl || "").trim().replace(/\/+$/, "");

  if (!enabled) {
    return {
      ...DEFAULT_CONFIG,
      enabled: false
    };
  }

  if (!rawBase) {
    throw new Error("NOEMA server is enabled but no baseUrl was configured.");
  }

  let url;
  try {
    url = new URL(rawBase);
  } catch {
    throw new Error("NOEMA server baseUrl must be a valid absolute URL.");
  }

  if (url.username || url.password) {
    throw new Error("Credentials must never be embedded in the NOEMA server URL.");
  }

  const secure = url.protocol === "https:";
  const localDev = url.protocol === "http:" && isLocalhost(url.hostname);

  if (!secure && !localDev) {
    throw new Error("NOEMA remote account servers must use HTTPS. HTTP is allowed only for localhost development.");
  }

  return {
    enabled: true,
    baseUrl: url.origin + url.pathname.replace(/\/+$/, ""),
    apiPrefix: String(merged.apiPrefix || "/api/v1").startsWith("/")
      ? String(merged.apiPrefix || "/api/v1")
      : `/${String(merged.apiPrefix || "api/v1")}`,
    timeoutMs: Math.max(2000, Math.min(60000, Number(merged.timeoutMs) || 12000)),
    credentialsMode: "include",
    expectedHealthPath: String(merged.expectedHealthPath || "/health").startsWith("/")
      ? String(merged.expectedHealthPath || "/health")
      : `/${String(merged.expectedHealthPath || "health")}`
  };
}

/*
  Deployment seam:
  Change ONLY this object when a real secure host exists.

  Example:
  export const NOEMA_SERVER_CONFIG = normalizeServerConfig({
    enabled: true,
    baseUrl: "https://noema.example.org",
    apiPrefix: "/api/v1"
  });

  Never place API keys, passwords, database credentials, session tokens,
  or private secrets in this public file.
*/
export const NOEMA_SERVER_CONFIG = normalizeServerConfig(DEFAULT_CONFIG);

export function getServerStatus() {
  return {
    enabled: NOEMA_SERVER_CONFIG.enabled,
    baseUrl: NOEMA_SERVER_CONFIG.enabled ? NOEMA_SERVER_CONFIG.baseUrl : "",
    mode: NOEMA_SERVER_CONFIG.enabled ? "remote-ready" : "local-only"
  };
}
