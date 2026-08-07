const RULES = Object.freeze([
  { id: "medical", pattern: /\b(diagnos|dose|medication|symptom|medical|doctor|hospital|treatment)\b/i },
  { id: "legal", pattern: /\b(lawsuit|legal advice|attorney|court|criminal|contract dispute|sue)\b/i },
  { id: "financial", pattern: /\b(invest|retirement|tax advice|securities|mortgage|financial advice)\b/i },
  { id: "emergency", pattern: /\b(emergency|immediate danger|overdose|suicide|kill myself|hurt myself)\b/i }
]);

export function evaluateAdultBoundary(message = "") {
  const categories = RULES
    .filter(rule => rule.pattern.test(String(message || "")))
    .map(rule => rule.id);

  return {
    highStakes: categories.length > 0,
    categories,
    emergency: categories.includes("emergency"),
    requiresCurrentQualifiedSources:
      categories.some(id => ["medical", "legal", "financial"].includes(id))
  };
}
