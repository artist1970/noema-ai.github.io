import {analyzeClaim} from "./claim-analyzer.js";

const EXPLICIT_RESEARCH = /\b(verify|fact[\s-]?check|source|citation|research|evidence|is it true|did this happen|latest|current|today|news)\b/i;

export function assessResearchRequirement(route={}, message="") {
  const analysis=analyzeClaim(message);

  const modeRequires=["research","civic"].includes(route?.mode?.id);
  const domainRequires=analysis.domain !== "general";
  const safetyRequires=route?.safety?.highStakes === true;
  const explicit=EXPLICIT_RESEARCH.test(String(message || ""));
  const required=modeRequires || domainRequires || safetyRequires || explicit || analysis.contested || analysis.timeSensitive;

  return {
    required,
    analysis,
    reason:
      modeRequires ? "research-mode" :
      safetyRequires ? "high-stakes" :
      domainRequires ? `domain:${analysis.domain}` :
      explicit ? "explicit-verification-request" :
      analysis.contested ? "contested-claim" :
      analysis.timeSensitive ? "freshness-required" :
      "not-required"
  };
}
