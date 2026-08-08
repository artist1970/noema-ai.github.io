import { explicitPreferenceTerms, checkResourceEligibility, roleFromEnrollment } from "./resource-eligibility.js";
import { resolveLearningContext } from "./learning-context.js";
import { rankFederatedResources } from "./resource-ranker.js";
import { educationalGameStatus, queryRequestsGame } from "./educational-game-policy.js";
import { healthLearningPolicy, financeFreshnessPolicy } from "./domain-learning-policy.js";
import { RESOURCE_EXECUTION_STATES } from "./execution-state.js";

function currentInfoRequested(query = "", mode = "personal") {
  return mode === "research" ||
    /\b(current|latest|today|now|news|recent|updated|fresh|jobs?|market)\b/i.test(String(query || ""));
}

function queryTerms(query = "") {
  return [...new Set(
    String(query || "").toLowerCase()
      .replace(/[^a-z0-9-]+/g, " ")
      .split(/\s+/)
      .filter(term => term.length > 1)
  )].slice(0, 40);
}

function lexicalMatch(resource = {}, query = "") {
  const terms = queryTerms(query);
  if (!terms.length) return false;
  const haystack = [
    resource.title,
    resource.description,
    resource.repository,
    ...(resource.subjects || []),
    ...(resource.learningObjectives || []),
    ...(resource.domains || []),
    ...(resource.skills || []),
    ...(resource.tags || [])
  ].join(" ").toLowerCase();
  return terms.some(term => haystack.includes(term));
}

export function discoverCatalogResources(records = [], {
  query = "",
  mode = "personal",
  context = {},
  maxResults = 30
} = {}) {
  const learningContext = resolveLearningContext({ query, context });
  const audience = learningContext.effectiveAudience;
  const role = roleFromEnrollment(context.enrollment);
  const preferenceTerms = explicitPreferenceTerms({ query, context });
  const currentRequested = currentInfoRequested(query, mode);
  const wantsGame = queryRequestsGame(query);
  const eligible = [];
  const withheld = [];

  for (const resource of records) {
    const reasons = [];

    if (resource.recommendable !== true) reasons.push("catalog-not-recommendable");

    const eligibility = checkResourceEligibility(resource, {
      audience,
      role,
      preferenceTerms
    });
    reasons.push(...eligibility.reasons);

    if (resource.requiresExplicitQuery === true && !lexicalMatch(resource, query)) {
      reasons.push("explicit-query-required");
    }

    if (resource.explicitAdultOptIn === true && !["adult", "parent"].includes(audience)) {
      reasons.push("adult-opt-in-required");
    }

    const game = educationalGameStatus(resource);
    if (game.game && !game.eligibleForEducationalRanking && !wantsGame) {
      reasons.push("educational-game-objective-not-established");
    }

    if (reasons.length) {
      withheld.push({
        id: resource.id,
        sourceId: resource.sourceId,
        reasons: [...new Set(reasons)]
      });
      continue;
    }

    const health = healthLearningPolicy(resource, query);
    const finance = financeFreshnessPolicy(resource);

    eligible.push({
      ...resource,
      manifestProvenance: resource.catalogProvenance || "assessment-engine-generated-registry",
      manifestRefreshedAt: resource.catalogRefreshedAt || null,
      executionState: RESOURCE_EXECUTION_STATES.DISCOVERED,
      verified: false,
      freshnessStatus: resource.requiresFreshnessCheck ? "required" : "not-required",
      educationalGame: game,
      verifierRequired: health.verifierRequired,
      highStakesReason: health.highStakes ? health.reason : "",
      financeFreshnessRequired: finance.freshnessRequired
    });
  }

  const ranked = rankFederatedResources(eligible, {
    query,
    mode,
    currentSchoolSourceId: learningContext.currentSchoolSourceId,
    favoriteSubject: learningContext.favoriteSubject,
    currentInfoRequested: currentRequested
  }).filter(resource => {
    if (resource.resourceType === "game" && !resource.educationalGame.eligibleForEducationalRanking) {
      return resource.matches > 0;
    }
    return true;
  });

  const limit = Math.max(1, Math.min(60, Number(maxResults) || 30));

  return {
    learningContext,
    audience,
    role,
    preferenceTerms,
    currentInfoRequested: currentRequested,
    results: ranked.slice(0, limit),
    withheld,
    withheldCount: withheld.length
  };
}
