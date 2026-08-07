import {NoemaProvider} from "./provider-interface.js";
import {normalizeProviderResponse} from "./provider-response-normalizer.js";

export class SecureHttpProvider extends NoemaProvider {
  constructor(config={}, fetchImpl=globalThis.fetch) {
    super({
      id: config.id || "secure-http",
      label: "Secure HTTP Provider",
      kind: "remote",
      connected: config.enabled === true
    });
    this.config=config;
    this.fetchImpl=fetchImpl;
  }

  status() {
    return {
      ...super.status(),
      connected:this.connected && typeof this.fetchImpl === "function",
      endpoint:this.connected
        ? `${this.config.baseUrl}${this.config.endpointPath}`
        : "",
      credentialHandling:"server-side-only",
      browserBearerToken:false
    };
  }

  async respond(request={}) {
    if (!this.connected || typeof this.fetchImpl !== "function") {
      throw new Error("Secure HTTP provider is not configured.");
    }

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),this.config.timeoutMs || 30000);
    const started=Date.now();

    try {
      const response=await this.fetchImpl(
        `${this.config.baseUrl}${this.config.endpointPath}`,
        {
          method:"POST",
          credentials:"include",
          headers:{
            "Accept":"application/json",
            "Content-Type":"application/json"
          },
          body:JSON.stringify(request),
          signal:controller.signal
        }
      );

      const contentType=response.headers?.get?.("content-type") || "";
      const payload=contentType.includes("application/json")
        ? await response.json()
        : {text:await response.text()};

      if (!response.ok) {
        const message=payload?.message || payload?.error || `Provider request failed with status ${response.status}.`;
        throw new Error(String(message));
      }

      return normalizeProviderResponse({
        ...payload,
        provider:payload?.provider || this.id,
        generatedByModel:payload?.generatedByModel !== false,
        latencyMs:Date.now()-started
      },this.id);
    } finally {
      clearTimeout(timer);
    }
  }
}
