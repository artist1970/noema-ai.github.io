import { inferMode, getMode } from "./mode-router.js";
import { listModules } from "./module-registry.js";
import { evaluateAdultBoundary } from "../safety/adult-boundaries.js";
import { evaluatePrivacyBoundary } from "../safety/privacy-boundary.js";

export class ConversationOrchestrator {
  route(message, {
    mode,
    role = "adult"
  } = {}) {
    const text = String(message || "").trim();
    const selectedMode = getMode(mode || inferMode(text));

    return {
      message: text,
      role,
      mode: selectedMode,
      modules: listModules(selectedMode.modules),
      safety: evaluateAdultBoundary(text),
      privacy: evaluatePrivacyBoundary(text),
      requiresProvider: text.length > 0
    };
  }
}
