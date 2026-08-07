import { ConversationOrchestrator } from "./conversation-orchestrator.js";
import { buildNoemaContext } from "./context-builder.js";
import { PreferenceStore } from "../memory/preference-store.js";
import { ContinuityStore } from "../memory/continuity-store.js";

export class NoemaCore {
  constructor({
    role = "adult",
    storage,
    provider = null
  } = {}) {
    this.role = role;
    this.provider = provider;
    this.preferences = new PreferenceStore(storage);
    this.continuity = new ContinuityStore(storage);
    this.orchestrator = new ConversationOrchestrator();
    this.lastRoute = null;
  }

  getContext(mode = "personal") {
    return buildNoemaContext({
      role: this.role,
      mode,
      preferences: this.preferences.load().preferences,
      continuity: this.continuity.list(),
      provider: this.provider
    });
  }

  route(message, options = {}) {
    const route = this.orchestrator.route(message, {
      role: this.role,
      ...options
    });
    this.lastRoute = route;
    return route;
  }

  rememberExchange({ user = "", assistant = "", mode = "" } = {}) {
    if (!user && !assistant) return this.continuity.list();
    return this.continuity.add({
      user,
      assistant,
      mode
    });
  }

  clearNoemaData() {
    this.preferences.reset();
    this.continuity.reset();
  }
}
