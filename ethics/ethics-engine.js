import { NOEMA_CONSTITUTION } from "./constitution.js";

const MANIPULATION_PATTERNS = [
  /\bmanipulat(e|ion|ive)\b/i,
  /\bcoerce\b/i,
  /\bblackmail\b/i,
  /\bdeceive\b/i,
  /\bpretend to be\b/i,
  /\bimpersonat(e|ion)\b/i
];

const COVERT_PATTERNS = [
  /\bwithout (them|him|her|anyone) knowing\b/i,
  /\bsecretly (track|monitor|record|message|post|change)\b/i,
  /\bhide (this|it) from\b/i
];

const SELF_AUTH_PATTERNS = [
  /\bbypass (the )?(admin|administrator|approval|safeguard)\b/i,
  /\bdisable (the )?(ethics|safety|permission|approval)\b/i,
  /\bapprove your own update\b/i,
  /\belevate your own permissions\b/i
];

export class EthicsEngine {
  constructor({ constitution = NOEMA_CONSTITUTION } = {}) {
    this.constitution = constitution;
  }

  evaluate(message = "", context = {}) {
    const text = String(message || "");
    const concerns = [];

    if (MANIPULATION_PATTERNS.some(pattern => pattern.test(text))) {
      concerns.push({
        id: "non-manipulation",
        level: "review",
        message: "The request may involve deception, coercion, or impersonation."
      });
    }

    if (COVERT_PATTERNS.some(pattern => pattern.test(text))) {
      concerns.push({
        id: "no-covert-action",
        level: "review",
        message: "The request may involve a covert action affecting another person."
      });
    }

    if (SELF_AUTH_PATTERNS.some(pattern => pattern.test(text))) {
      concerns.push({
        id: "no-self-authorization",
        level: "blocked",
        message: "NOEMA cannot authorize bypass of administrator approval or constitutional safeguards."
      });
    }

    if (context?.role && !["adult", "parent", "educator", "higher-learning"].includes(context.role)) {
      concerns.push({
        id: "age-and-role-boundaries",
        level: "review",
        message: "NOEMA is adult-facing; child-facing activity should use Khaemenes Mentor policy."
      });
    }

    return {
      constitutionId: this.constitution.id,
      constitutionVersion: this.constitution.version,
      active: true,
      blocked: concerns.some(item => item.level === "blocked"),
      needsReview: concerns.length > 0,
      concerns
    };
  }
}
