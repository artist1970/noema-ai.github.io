const SENSITIVE_PATTERNS = Object.freeze([
  /\bpassword\b/i,
  /\bapi key\b/i,
  /\bsecret key\b/i,
  /\bsocial security\b/i,
  /\bcredit card\b/i,
  /\bprivate key\b/i
]);

export function evaluatePrivacyBoundary(message = "") {
  const text = String(message || "");
  const sensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
  return {
    sensitive,
    recommendation: sensitive
      ? "Avoid storing or sending secrets through the public/static shell."
      : "No obvious credential-like content detected."
  };
}
