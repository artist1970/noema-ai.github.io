export const NOEMA_PROTOCOL_VERSION = "1.0";

function randomId(prefix) {
  return globalThis.crypto?.randomUUID
    ? `${prefix}_${globalThis.crypto.randomUUID()}`
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}

export function createNoemaProviderRequest({
  sessionId,
  message,
  role="adult",
  mode="personal",
  contextEnvelope={},
  research=null,
  delegation=null,
  safety=null
}={}) {
  return {
    protocol: "noema-provider",
    protocolVersion: NOEMA_PROTOCOL_VERSION,
    requestId: randomId("req"),
    sessionId: String(sessionId || randomId("session")).slice(0,140),
    createdAt: new Date().toISOString(),

    message: {
      role: "user",
      content: String(message || "").trim().slice(0,20000)
    },

    noema: {
      identity: "NOEMA",
      role: String(role || "adult").slice(0,60),
      mode: String(mode || "personal").slice(0,60),
      constitutionActive: true
    },

    context: contextEnvelope || {},

    research: research
      ? {
          required: research.required === true,
          domain: String(research.domain || "general"),
          status: String(research.status || "unexamined"),
          verifiedLabelAllowed: research.verifiedLabelAllowed === true,
          missingRequiredLanes: [...(research.missingRequiredLanes || [])].slice(0,12)
        }
      : {
          required: false,
          domain: "general",
          status: "not-applicable",
          verifiedLabelAllowed: false,
          missingRequiredLanes: []
        },

    delegation: delegation || { primary: "noema", specialists: [] },

    safety: {
      blocked: safety?.blocked === true,
      needsReview: safety?.needsReview === true,
      highStakes: safety?.highStakes === true,
      categories: [...(safety?.categories || [])].slice(0,12)
    },

    responseContract: {
      returnText: true,
      citationsAllowed: true,
      evidenceRecordsAllowed: true,
      chainOfThoughtRequested: false,
      permissionChangesAllowed: false,
      memoryWritesAllowed: false,
      autonomousActionsAllowed: false
    }
  };
}
