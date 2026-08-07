import { NOEMA_SERVER_CONFIG } from "../config/server-config.js";

export class AccountServerClient {
  constructor(config = NOEMA_SERVER_CONFIG, fetchImpl = globalThis.fetch) {
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  get connected() {
    return this.config.enabled === true && typeof this.fetchImpl === "function";
  }

  status() {
    return {
      id: "noema-account-server",
      enabled: this.config.enabled === true,
      connected: this.connected,
      baseUrl: this.config.enabled ? this.config.baseUrl : "",
      credentialStorage: "server-session-cookie-only",
      browserTokenStorage: false
    };
  }

  async #request(path, options = {}) {
    if (!this.connected) {
      throw new Error("NOEMA secure account server is not configured.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await this.fetchImpl(
        `${this.config.baseUrl}${this.config.apiPrefix}${path}`,
        {
          ...options,
          credentials: "include",
          headers: {
            "Accept": "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
          },
          signal: controller.signal
        }
      );

      const contentType = response.headers?.get?.("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof payload === "object" && payload?.message
          ? payload.message
          : `Server request failed with status ${response.status}.`;
        throw new Error(message);
      }

      return payload;
    } finally {
      clearTimeout(timer);
    }
  }

  async health() {
    if (!this.connected) {
      return { ok: false, mode: "local-only", reason: "No secure server configured." };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await this.fetchImpl(
        `${this.config.baseUrl}${this.config.expectedHealthPath}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Accept": "application/json" },
          signal: controller.signal
        }
      );
      return { ok: response.ok, status: response.status };
    } catch (error) {
      return { ok: false, reason: String(error?.message || error) };
    } finally {
      clearTimeout(timer);
    }
  }

  // Future server contract. Passwords are sent only over HTTPS to the server
  // and are never persisted by this browser client.
  register(payload) {
    return this.#request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  login(payload) {
    return this.#request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  logout() {
    return this.#request("/auth/logout", { method: "POST" });
  }

  me() {
    return this.#request("/account/me", { method: "GET" });
  }

  saveEnrollment(profile) {
    return this.#request("/enrollment/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    });
  }

  getMentorRelationship() {
    return this.#request("/mentor/relationship", { method: "GET" });
  }
}
