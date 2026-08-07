import { CAPABILITY_STATES } from "./capability-ledger.js";

export class ActionGate {
  constructor({ ledger } = {}) {
    this.ledger = ledger;
  }

  evaluate(capabilityId, {
    confirmed = false,
    adminAuthorized = false,
    conditionsSatisfied = []
  } = {}) {
    const capability = this.ledger?.get?.(capabilityId);

    if (!capability) {
      return {
        capabilityId,
        allowed: false,
        state: CAPABILITY_STATES.UNAVAILABLE,
        reason: "Capability is not registered."
      };
    }

    if (capability.state === CAPABILITY_STATES.BLOCK) {
      return {
        capabilityId,
        allowed: false,
        state: capability.state,
        reason: capability.description
      };
    }

    if (capability.state === CAPABILITY_STATES.ADMIN && !adminAuthorized) {
      return {
        capabilityId,
        allowed: false,
        state: capability.state,
        reason: "Authenticated administrator approval is required."
      };
    }

    if (capability.state === CAPABILITY_STATES.CONFIRM && !confirmed) {
      return {
        capabilityId,
        allowed: false,
        state: capability.state,
        reason: "Explicit user confirmation is required."
      };
    }

    const required = capability.conditions || [];
    const supplied = new Set(conditionsSatisfied || []);
    const missing = required.filter(condition => !supplied.has(condition));

    if (missing.length) {
      return {
        capabilityId,
        allowed: false,
        state: "conditional",
        missing,
        reason: `Required condition${missing.length === 1 ? "" : "s"} not satisfied: ${missing.join(", ")}.`
      };
    }

    return {
      capabilityId,
      allowed: true,
      state: capability.state,
      reason: "Capability gate passed."
    };
  }
}
