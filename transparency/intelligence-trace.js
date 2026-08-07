export function createIntelligenceTrace({
  route={},
  delegation={},
  researchDecision={},
  verifierSession=null,
  providerTrace=null
}={}) {
  return {
    mode:route.mode?.id || "personal",
    role:route.role || "adult",
    constitution:{
      active:true,
      blocked:route.ethics?.blocked === true,
      needsReview:route.ethics?.needsReview === true
    },
    privacy:{
      sensitive:route.privacy?.sensitive === true
    },
    research:{
      required:researchDecision?.required === true,
      reason:researchDecision?.reason || "",
      domain:researchDecision?.analysis?.domain || "general",
      evidenceStatus:verifierSession?.verdict?.status || "not-applicable"
    },
    delegation:{
      primary:delegation?.primary || "NOEMA",
      specialists:[...(delegation?.specialists || [])]
    },
    provider:providerTrace,
    internalReasoningExposed:false
  };
}
