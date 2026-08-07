import {LocalPlaceholderProvider} from "./local-placeholder.js";
import {SecureHttpProvider} from "./http-provider.js";

export class ProviderRegistry {
  constructor() {
    this.providers=new Map();
    this.activeId="local-placeholder";
  }

  register(provider) {
    if (!provider?.id) throw new Error("Provider must have an id.");
    this.providers.set(provider.id,provider);
    return provider;
  }

  setActive(id) {
    if (!this.providers.has(id)) return false;
    this.activeId=id;
    return true;
  }

  active() {
    return this.providers.get(this.activeId) || this.providers.get("local-placeholder") || null;
  }

  list() {
    return [...this.providers.values()].map(provider=>provider.status());
  }
}

export function createProviderRegistry(config={}, fetchImpl=globalThis.fetch) {
  const registry=new ProviderRegistry();
  registry.register(new LocalPlaceholderProvider());

  if (config?.remote?.enabled) {
    registry.register(new SecureHttpProvider(config.remote,fetchImpl));
  }

  if (!registry.setActive(config?.activeProvider || "local-placeholder")) {
    registry.setActive("local-placeholder");
  }

  return registry;
}
