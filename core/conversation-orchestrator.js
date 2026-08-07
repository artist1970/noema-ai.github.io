import { inferMode, getMode } from "./mode-router.js";
import { listModules } from "./module-registry.js";
import { evaluateAdultBoundary } from "../safety/adult-boundaries.js";
import { evaluatePrivacyBoundary } from "../safety/privacy-boundary.js";
import { EthicsEngine } from "../ethics/ethics-engine.js";
import { CapabilityLedger } from "../permissions/capability-ledger.js";
import { ActionGate } from "../permissions/action-gate.js";
import { createRouteTrace } from "../transparency/route-trace.js";

export class ConversationOrchestrator {
  constructor({
    ethicsEngine,
    capabilityLedger
  } = {}) {
    this.ethics = ethicsEngine || new EthicsEngine();
    this.ledger = capabilityLedger || new CapabilityLedger();
    this.gate = new ActionGate({ ledger: this.ledger });
  }

  route(message, {
    mode,
    role = "adult"
  } = {}) {
    const text = String(message || "").trim();
    const selectedMode = getMode(mode || inferMode(text));
    const safety = evaluateAdultBoundary(text);
    const privacy = evaluatePrivacyBoundary(text);
    const ethics = this.ethics.evaluate(text, { role, mode: selectedMode.id });

    const route = {
      message: text,
      role,
      mode: selectedMode,
      modules: listModules(selectedMode.modules),
      safety,
      privacy,
      ethics,
      requiresProvider: text.length > 0 && !ethics.blocked
    };

    route.trace = createRouteTrace({
      route,
      ethics,
      capabilitySummary: [
        this.ledger.get("conversation.respond"),
        this.ledger.get("resources.search"),
        this.ledger.get("code.propose-update"),
        this.ledger.get("code.deploy-canonical")
      ].filter(Boolean)
    });

    return route;
  }

  checkCapability(capabilityId, options = {}) {
    return this.gate.evaluate(capabilityId, options);
  }

  listCapabilities() {
    return this.ledger.list();
  }
}
