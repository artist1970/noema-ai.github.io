export const SOURCE_LEVELS = Object.freeze(["primary","secondary","tertiary","unknown"]);
export const EVIDENCE_RELATIONS = Object.freeze(["supporting","opposing","contextual","insufficient"]);

export const DOMAIN_REQUIREMENTS = Object.freeze({
  general: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes","verifier"],
    optionalLanes: ["khaemenes","evidence-studio"]
  },
  news: {
    minimumIndependentFamilies: 3,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes","verifier"],
    optionalLanes: ["arshif","evidence-studio"],
    geographicDiversity: true
  },
  historical: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes"],
    optionalLanes: ["verifier","evidence-studio"]
  },
  education: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes"],
    optionalLanes: ["evidence-studio"]
  },
  science: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes"],
    optionalLanes: ["solanar","verifier","evidence-studio"]
  },
  medical: {
    minimumIndependentFamilies: 3,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes","medicament"],
    optionalLanes: ["verifier","evidence-studio"],
    highStakes: true,
    preferredSourceTypes: [
      "systematic-review","meta-analysis","clinical-guideline","regulatory-document",
      "peer-reviewed-study","public-health-data"
    ]
  },
  legal: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes","firmament"],
    optionalLanes: ["verifier","evidence-studio"],
    highStakes: true,
    preferredSourceTypes: [
      "constitution","statute","regulation","court-opinion","official-docket",
      "agency-record","official-guidance"
    ]
  },
  atmospheric: {
    minimumIndependentFamilies: 2,
    preferredPrimary: true,
    requiredLanes: ["arshif","khaemenes","solanar"],
    optionalLanes: ["verifier","evidence-studio"],
    highStakes: true,
    preferredSourceTypes: [
      "official-warning","direct-observation","radar","satellite","buoy",
      "station-observation","forecast-model","air-quality-monitor"
    ]
  }
});

export function requirementsForDomain(domain="general") {
  return DOMAIN_REQUIREMENTS[domain] || DOMAIN_REQUIREMENTS.general;
}

export function sourceFamily(source={}) {
  return String(
    source.independenceFamily ||
    source.parentOrganization ||
    source.organization ||
    source.publisher ||
    source.domain ||
    source.url ||
    source.title ||
    "unknown"
  ).trim().toLowerCase();
}

export function isPrimarySource(source={}) {
  return source.level === "primary";
}

export function normalizeSource(source={}) {
  return {
    id: String(source.id || cryptoRandom()).slice(0,140),
    title: String(source.title || "Untitled source").trim().slice(0,500),
    url: String(source.url || "").trim().slice(0,1600),
    organization: String(source.organization || "").trim().slice(0,300),
    publisher: String(source.publisher || "").trim().slice(0,300),
    parentOrganization: String(source.parentOrganization || "").trim().slice(0,300),
    independenceFamily: String(source.independenceFamily || "").trim().slice(0,300),
    level: SOURCE_LEVELS.includes(source.level) ? source.level : "unknown",
    type: String(source.type || "unknown").trim().slice(0,120),
    jurisdiction: String(source.jurisdiction || "").trim().slice(0,180),
    region: String(source.region || "").trim().slice(0,120),
    language: String(source.language || "").trim().slice(0,60),
    publicationDate: String(source.publicationDate || "").trim().slice(0,40),
    accessedAt: String(source.accessedAt || new Date().toISOString()).slice(0,40),
    relation: EVIDENCE_RELATIONS.includes(source.relation) ? source.relation : "contextual",
    confidence: ["high","medium","low"].includes(source.confidence) ? source.confidence : "medium",
    reliabilityNotes: String(source.reliabilityNotes || "").trim().slice(0,3000),
    evidenceNotes: String(source.evidenceNotes || "").trim().slice(0,5000),
    sourceFamily: sourceFamily(source)
  };
}

function cryptoRandom() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
