export function createIntelligenceTrace({
  route={},
  delegation={},
  researchDecision={},
  verifierSession=null,
  providerTrace=null,
  orchestration=null
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
    orchestration: orchestration
      ? {
          totalTasks:orchestration.summary?.total || 0,
          finishedTasks:orchestration.summary?.finished || 0,
          handoffCount:(orchestration.tasks || []).filter(t=>t.status==="handoff").length,
          unavailableCount:(orchestration.tasks || []).filter(t=>t.status==="unavailable").length
        }
      : null,
    provider:providerTrace,
    internalReasoningExposed:false
  };
}
