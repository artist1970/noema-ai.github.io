export function createProviderTrace({
  providerStatus={},
  request={},
  response={},
  research=null
}={}) {
  return {
    provider:{
      id:providerStatus.id || response.provider || "unknown",
      label:providerStatus.label || "",
      kind:providerStatus.kind || "",
      connected:providerStatus.connected === true,
      model:response.model || ""
    },
    protocol:request.protocol || "",
    protocolVersion:request.protocolVersion || "",
    requestId:request.requestId || "",
    generatedByModel:response.generatedByModel === true,
    evidenceRecordsReturned:Array.isArray(response.evidence) ? response.evidence.length : 0,
    citationsReturned:Array.isArray(response.citations) ? response.citations.length : 0,
    research:{
      required:research?.required === true,
      domain:research?.domain || "",
      status:research?.status || "",
      verifiedLabelAllowed:research?.verifiedLabelAllowed === true
    },
    internalReasoningExposed:false
  };
}
