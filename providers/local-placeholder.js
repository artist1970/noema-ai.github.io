import {NoemaProvider} from "./provider-interface.js";
import {normalizeProviderResponse} from "./provider-response-normalizer.js";

export class LocalPlaceholderProvider extends NoemaProvider {
  constructor() {
    super({
      id:"local-placeholder",
      label:"Local fallback",
      kind:"local-placeholder",
      connected:false
    });
  }

  async respond(request={}) {
    if (request?.safety?.blocked) {
      return normalizeProviderResponse({
        text:
          "That request conflicts with a constitutional boundary I cannot authorize. " +
          "I can still help with a lawful, transparent, non-covert alternative.",
        generatedByModel:false,
        provider:this.id
      },this.id);
    }

    const mode=request?.noema?.mode || "personal";
    const specialists=request?.delegation?.specialists || [];
    const specialistText=specialists.length
      ? ` Relevant specialist systems: ${specialists.join(", ")}.`
      : "";

    if (request?.research?.required) {
      const missing=request.research.missingRequiredLanes || [];
      return normalizeProviderResponse({
        text:
          `I have prepared this as a ${request.research.domain} verification task.${specialistText} ` +
          "The Verifier can organize evidence and apply the fact-status gates, but live multi-source retrieval is not connected in this static release. " +
          (missing.length ? `Required evidence lanes still include: ${missing.join(", ")}. ` : "") +
          "I will not label the claim verified until those evidence requirements are actually satisfied.",
        generatedByModel:false,
        provider:this.id
      },this.id);
    }

    return normalizeProviderResponse({
      text:
        `NOEMA has prepared this request in ${mode} mode.${specialistText} ` +
        "The conversation engine is active, but a conversational model provider is not connected yet.",
      generatedByModel:false,
      provider:this.id
    },this.id);
  }
}
