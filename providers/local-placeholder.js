import { NoemaProvider } from "./provider-interface.js";

export class LocalPlaceholderProvider extends NoemaProvider {
  constructor() {
    super({ id: "local-placeholder" });
  }

  async respond({ route } = {}) {
    if (route?.ethics?.blocked) {
      return {
        text:
          "That request conflicts with a constitutional boundary I cannot authorize. " +
          "I can still help with a lawful, transparent, non-covert alternative.",
        generatedByModel: false,
        provider: this.id
      };
    }

    const moduleNames = (route?.modules || []).map(module => module.label).join(", ");
    const concernNote = route?.ethics?.needsReview
      ? " I would also treat this request with additional ethics review before any consequential action."
      : "";

    return {
      text:
        `NOEMA has routed this request to ${route?.mode?.label || "Personal"} mode.` +
        (moduleNames ? ` Relevant specialist systems: ${moduleNames}.` : "") +
        concernNote +
        " A conversational model provider is not connected yet.",
      generatedByModel: false,
      provider: this.id
    };
  }
}
