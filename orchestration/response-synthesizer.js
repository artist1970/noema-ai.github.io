function clean(value,max=50000){return String(value || "").trim().slice(0,max)}

export function synthesizeIntegratedResponse({
  providerResponse={},
  orchestration={},
  research={},
  route={}
}={}) {
  const handoffs=(orchestration.tasks || [])
    .filter(t=>t.status==="handoff" && t.output?.url)
    .map(t=>({
      specialistId:t.specialistId,
      label:t.label,
      url:t.output.url,
      executed:false
    }));

  const unavailable=(orchestration.tasks || [])
    .filter(t=>["unavailable","blocked"].includes(t.status))
    .map(t=>({
      specialistId:t.specialistId,
      status:t.status,
      reason:t.output?.reason || t.note || ""
    }));

  const mentor=(orchestration.tasks || [])
    .find(t=>t.specialistId==="mentor" && t.status==="complete")
    ?.output?.adaptation || null;

  const decision=(orchestration.tasks || [])
    .find(t=>t.specialistId==="sovereign" && t.status==="complete")
    ?.output || null;

  const resources=(orchestration.tasks || [])
    .find(t=>t.specialistId==="resource-director" && t.status==="complete")
    ?.output || null;

  return {
    text:clean(providerResponse.text),
    provider:providerResponse.provider || "",
    model:providerResponse.model || "",
    generatedByModel:providerResponse.generatedByModel === true,
    citations:[...(providerResponse.citations || [])],
    evidence:[...(providerResponse.evidence || [])],

    coordination:{
      goal:orchestration.plan?.goal || "",
      taskCount:orchestration.summary?.total || 0,
      finishedTaskCount:orchestration.summary?.finished || 0,
      handoffs,
      unavailable,
      mentorAdaptation:mentor,
      decisionSupport:decision,
      resources
    },

    research:{
      required:research.required === true,
      domain:research.domain || "general",
      status:research.status || "not-applicable",
      verifiedLabelAllowed:research.verifiedLabelAllowed === true
    },

    safety:{
      blocked:route.ethics?.blocked === true,
      needsReview:route.ethics?.needsReview === true
    }
  };
}
