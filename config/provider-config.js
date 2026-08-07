const DEFAULT_PROVIDER_CONFIG = Object.freeze({
  activeProvider: "local-placeholder",
  remote: {
    enabled: false,
    id: "secure-http",
    baseUrl: "",
    endpointPath: "/api/v1/noema/respond",
    timeoutMs: 30000,
    credentialsMode: "include"
  }
});

function isLocalhost(hostname="") {
  return ["localhost","127.0.0.1","::1"].includes(hostname);
}

export function normalizeProviderConfig(input={}) {
  const merged = {
    ...DEFAULT_PROVIDER_CONFIG,
    ...(input || {}),
    remote: {
      ...DEFAULT_PROVIDER_CONFIG.remote,
      ...(input?.remote || {})
    }
  };

  const remote = { ...merged.remote };
  remote.enabled = remote.enabled === true;
  remote.timeoutMs = Math.max(3000, Math.min(120000, Number(remote.timeoutMs) || 30000));
  remote.credentialsMode = "include";

  if (!remote.enabled) {
    remote.baseUrl = "";
  } else {
    const raw = String(remote.baseUrl || "").trim().replace(/\/+$/, "");
    if (!raw) throw new Error("A remote provider baseUrl is required when the provider is enabled.");

    let url;
    try { url = new URL(raw); }
    catch { throw new Error("The remote provider baseUrl must be a valid absolute URL."); }

    if (url.username || url.password) {
      throw new Error("Provider credentials must never be embedded in the public provider URL.");
    }

    const secure = url.protocol === "https:";
    const localDev = url.protocol === "http:" && isLocalhost(url.hostname);
    if (!secure && !localDev) {
      throw new Error("Remote NOEMA providers must use HTTPS. HTTP is allowed only for localhost development.");
    }

    remote.baseUrl = url.origin + url.pathname.replace(/\/+$/, "");
    remote.endpointPath = String(remote.endpointPath || "/api/v1/noema/respond");
    if (!remote.endpointPath.startsWith("/")) remote.endpointPath = `/${remote.endpointPath}`;
  }

  return {
    activeProvider: String(merged.activeProvider || "local-placeholder"),
    remote
  };
}

/*
  Future secure provider seam.

  A production deployment may switch to:
    activeProvider: "secure-http"
    remote.enabled: true
    remote.baseUrl: "https://your-secure-noema-host.example"

  Never place API keys, model-provider keys, passwords, bearer tokens,
  database credentials, or private secrets in this public file.
*/
export const NOEMA_PROVIDER_CONFIG = normalizeProviderConfig(DEFAULT_PROVIDER_CONFIG);
