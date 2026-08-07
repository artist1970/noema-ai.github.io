export function healthLearningPolicy(resource={},query="") {
  if(resource.highStakesDomain!=="medical") {
    return {highStakes:false,verifierRequired:false,reason:"not-medical"};
  }

  const q=String(query || "");
  const personalized=/\b(my|me|i have|should i|dose|dosage|diagnos|treat|symptom|medication|supplement|diet for me)\b/i.test(q);
  const factual=/\b(health|medical|disease|treatment|nutrition|medicine|drug|symptom|diagnosis|therapy)\b/i.test(q);

  return {
    highStakes:true,
    verifierRequired:personalized || factual,
    reason:personalized ? "personalized-health" : factual ? "health-factual" : "health-education-resource"
  };
}

export function financeFreshnessPolicy(resource={}) {
  if(resource.sourceId!=="verve.finance") return {finance:false,freshnessRequired:false};
  return {
    finance:true,
    freshnessRequired:resource.requiresFreshnessCheck===true || resource.dynamicContent===true
  };
}
