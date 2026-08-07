const FORBIDDEN_PROVIDER_FIELDS = Object.freeze([
  "chainOfThought","chain_of_thought","reasoning","internalReasoning",
  "scratchpad","thoughts","permissionChanges","permissions",
  "memoryWrites","memoryMutations","adminActions","autonomousActions"
]);

function cleanText(value,max=50000) {
  return String(value || "").trim().slice(0,max);
}

export function normalizeProviderResponse(raw={}, fallbackProvider="unknown") {
  const object = typeof raw === "string" ? {text:raw} : (raw || {});
  const warnings=[];

  for (const field of FORBIDDEN_PROVIDER_FIELDS) {
    if (field in object) warnings.push(`Ignored provider field: ${field}`);
  }

  const evidence = Array.isArray(object.evidence)
    ? object.evidence.slice(0,24).map(item=>({
        title:cleanText(item?.title,500),
        url:cleanText(item?.url,1600),
        organization:cleanText(item?.organization,300),
        level:["primary","secondary","tertiary","unknown"].includes(item?.level) ? item.level : "unknown",
        relation:["supporting","opposing","contextual","insufficient"].includes(item?.relation) ? item.relation : "contextual",
        independenceFamily:cleanText(item?.independenceFamily,300),
        region:cleanText(item?.region,180),
        publicationDate:cleanText(item?.publicationDate,40),
        confidence:["high","medium","low"].includes(item?.confidence) ? item.confidence : "medium",
        evidenceNotes:cleanText(item?.evidenceNotes,5000)
      })).filter(item=>item.title || item.url)
    : [];

  return {
    text: cleanText(object.text || object.message || object.content),
    provider: cleanText(object.provider || fallbackProvider,120) || fallbackProvider,
    model: cleanText(object.model,160),
    generatedByModel: object.generatedByModel === true,
    citations: Array.isArray(object.citations)
      ? object.citations.slice(0,36).map(item=>({
          label:cleanText(item?.label || item?.title,300),
          url:cleanText(item?.url,1600)
        })).filter(item=>item.url)
      : [],
    evidence,
    warnings,
    providerMetadata: {
      latencyMs: Number.isFinite(Number(object.latencyMs)) ? Number(object.latencyMs) : null,
      finishReason: cleanText(object.finishReason,80)
    }
  };
}
