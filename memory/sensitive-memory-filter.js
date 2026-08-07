const BLOCKED_MEMORY_PATTERNS = Object.freeze([
  { id: "password", pattern: /\bpassword\b/i },
  { id: "api-key", pattern: /\b(api[\s_-]?key|secret[\s_-]?key)\b/i },
  { id: "private-key", pattern: /\bprivate[\s_-]?key\b/i },
  { id: "social-security", pattern: /\b(social security|ssn)\b/i },
  { id: "payment-card", pattern: /\b(credit card|debit card|card number|cvv)\b/i },
  { id: "auth-token", pattern: /\b(access token|refresh token|bearer token)\b/i }
]);

export function inspectMemoryForSecrets(value = "") {
  const text = String(value || "");
  const matches = BLOCKED_MEMORY_PATTERNS
    .filter(rule => rule.pattern.test(text))
    .map(rule => rule.id);

  return {
    safeForOrdinaryMemory: matches.length === 0,
    matches,
    reason: matches.length
      ? "This looks like credential or highly sensitive secret material and should not be stored in ordinary NOEMA memory."
      : "No obvious credential-like material detected."
  };
}
