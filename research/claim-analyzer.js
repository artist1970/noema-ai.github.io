const DOMAIN_RULES = Object.freeze([
  { id:"medical", words:["medicine","medical","health","disease","treatment","drug","vaccine","symptom","diagnosis","therapy","nutrition","supplement","herb","clinical"] },
  { id:"legal", words:["law","legal","statute","court","judge","case","regulation","constitution","rights","ordinance","docket","ruling","appeal"] },
  { id:"atmospheric", words:["weather","storm","hurricane","tornado","rain","temperature","climate","atmosphere","satellite","solar","space weather","air quality","flood","wind"] },
  { id:"education", words:["curriculum","school","student","teacher","grade","education","lesson","academic","standard","course"] },
  { id:"historical", words:["history","historical","archive","archival","manuscript","census","century","ancient","war","treaty"] },
  { id:"news", words:["today","latest","breaking","reported","news","election","government","president","minister","conflict","war","market"] },
  { id:"science", words:["study","research","scientist","experiment","data","evidence","physics","chemistry","biology","astronomy"] }
]);

const CONTESTED_HINTS = [
  "controversial","disputed","hoax","fake","cover up","cover-up","conspiracy",
  "they say","everyone says","media says","government says","proves","debunk",
  "bias","censored","suppressed","gatekeep","gatekept"
];

export function analyzeClaim(text="", {domain=""}={}) {
  const claim = String(text || "").trim().slice(0, 5000);
  const low = claim.toLowerCase();

  let detected = domain && domain !== "auto" ? domain : "general";
  if (detected === "general") {
    let best = {id:"general", score:0};
    const hasTerm = term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = term.includes(" ")
        ? new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i")
        : new RegExp(`\\b${escaped}\\b`, "i");
      return pattern.test(low);
    };

    for (const rule of DOMAIN_RULES) {
      const score = rule.words.reduce((n, word)=>n + (hasTerm(word) ? 1 : 0), 0);
      if (score > best.score) best = {id:rule.id, score};
    }
    detected = best.id;
  }

  const timeSensitive =
    ["news","atmospheric","medical","legal"].includes(detected) ||
    /\b(today|now|current|currently|latest|this week|this month|202[0-9])\b/i.test(claim);

  const contested = CONTESTED_HINTS.some(term=>low.includes(term));

  const consequence =
    detected === "medical" ? "high" :
    detected === "legal" ? "high" :
    detected === "atmospheric" && /\b(warning|hurricane|tornado|flood|evacuat|danger|severe)\b/i.test(claim) ? "high" :
    "ordinary";

  return {
    claim,
    domain: detected,
    timeSensitive,
    contested,
    consequence,
    requiresVerifier: claim.length > 0,
    requiresIndependentCorroboration: contested || consequence === "high",
    requiresFreshness: timeSensitive
  };
}
