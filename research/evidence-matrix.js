import {FACT_STATUSES} from "./fact-status.js";
import {requirementsForDomain,isPrimarySource} from "./source-policy.js";
import {analyzeSourceIndependence, geographicDiversitySatisfied} from "./source-independence.js";

function confidenceWeight(level) {
  return level === "high" ? 3 : level === "medium" ? 2 : 1;
}

function relationWeight(relation) {
  if (relation === "supporting") return 1;
  if (relation === "opposing") return -1;
  return 0;
}

export function evaluateEvidence({
  claimAnalysis,
  sources=[],
  completedLaneIds=[],
  freshnessSatisfied=true
}={}) {
  const domain=claimAnalysis?.domain || "general";
  const req=requirementsForDomain(domain);
  const independence=analyzeSourceIndependence(sources);

  const support=sources
    .filter(s=>s.relation==="supporting")
    .reduce((n,s)=>n+confidenceWeight(s.confidence),0);
  const oppose=sources
    .filter(s=>s.relation==="opposing")
    .reduce((n,s)=>n+confidenceWeight(s.confidence),0);
  const ambiguous=sources.filter(s=>s.relation==="insufficient").length;
  const primaryCount=sources.filter(isPrimarySource).length;

  const missingRequiredLanes=(req.requiredLanes||[]).filter(id=>!completedLaneIds.includes(id));
  const independentEnough=independence.independentFamilyCount >= req.minimumIndependentFamilies;
  const primarySatisfied=!req.preferredPrimary || primaryCount > 0;
  const geoSatisfied=!req.geographicDiversity || geographicDiversitySatisfied(sources,2);
  const freshnessOk=!claimAnalysis?.requiresFreshness || freshnessSatisfied===true;

  const gates={
    requiredLanesComplete:missingRequiredLanes.length===0,
    independentEnough,
    primarySatisfied,
    geographicDiversitySatisfied:geoSatisfied,
    freshnessSatisfied:freshnessOk
  };

  const canVerify=Object.values(gates).every(Boolean);

  let status=FACT_STATUSES.UNEXAMINED;

  if(!sources.length) status=FACT_STATUSES.UNEXAMINED;
  else if(!freshnessOk) status=FACT_STATUSES.OUTDATED;
  else if(support>0 && oppose>0) status=FACT_STATUSES.DISPUTED;
  else if(oppose>=4 && support===0) status=FACT_STATUSES.CONTRADICTED;
  else if(canVerify && support>=6 && oppose===0 && ambiguous===0) status=FACT_STATUSES.VERIFIED;
  else if(support>=4 && oppose===0) status=FACT_STATUSES.STRONGLY_SUPPORTED;
  else if(support>0 && oppose===0) status=FACT_STATUSES.PARTIALLY_SUPPORTED;
  else status=FACT_STATUSES.INCONCLUSIVE;

  // "Verified fact" is deliberately conservative.
  if(status===FACT_STATUSES.VERIFIED && claimAnalysis?.contested && independence.independentFamilyCount < Math.max(3,req.minimumIndependentFamilies)) {
    status=FACT_STATUSES.STRONGLY_SUPPORTED;
  }

  return {
    status,
    domain,
    supportScore:support,
    oppositionScore:oppose,
    ambiguousCount:ambiguous,
    primaryCount,
    sourceCount:sources.length,
    independence,
    gates,
    missingRequiredLanes,
    canUseVerifiedLabel:status===FACT_STATUSES.VERIFIED
  };
}
