import { NoemaProvider } from "./provider-interface.js";

export class LocalPlaceholderProvider extends NoemaProvider {
  constructor() {
    super({ id: "local-placeholder" });
  }

  async respond({ route } = {}) {
    const moduleNames = (route?.modules || []).map(module => module.label).join(", ");
    return {
      text:
        `NOEMA has routed this request to ${route?.mode?.label || "Personal"} mode.` +
        (moduleNames ? ` Relevant specialist systems: ${moduleNames}.` : "") +
        " A conversational model provider is not connected yet.",
      generatedByModel: false,
      provider: this.id
    };
  }
}
