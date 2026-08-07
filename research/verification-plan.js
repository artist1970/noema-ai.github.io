import {lanesForDomain, INTERNATIONAL_NEWS_FAMILIES} from "./ecosystem-evidence-registry.js";
import {requirementsForDomain} from "./source-policy.js";

function task(id,label,laneId,purpose,requires=[]) {
  return {id,label,laneId,purpose,requires,status:"pending"};
}

export function buildVerificationPlan(claimAnalysis={}) {
  const domain=claimAnalysis.domain||"general";
  const req=requirementsForDomain(domain);
  const lanes=lanesForDomain(domain);

  const tasks=[
    task("claim-split","Define the factual claim","verifier",
      "Separate the checkable factual proposition from opinion, prediction, rhetoric, or value judgment."),
    task("archive-context","Search ARSHIF archives","arshif",
      "Search ARSHIF for archival records, historical context, source pathways, and relevant preserved knowledge. Record when no relevant material is found.",["claim-split"]),
    task("education-context","Search Khaemenes educational portals","khaemenes",
      "Search applicable Khaemenes educational portals for curriculum, standards, teaching context, and documented educational treatment. This is context, not privileged truth.",["claim-split"]),
    task("primary-record","Locate primary or official evidence","primary",
      "Seek the original record, dataset, statute, ruling, study, observation, transcript, filing, or official publication.",["claim-split"]),
    task("independent-check","Seek independent corroboration","independent",
      "Use sources that do not merely repeat the same publisher, wire service, institution, or underlying document.",["primary-record"])
  ];

  if(domain==="education") {
    tasks.push(task("education-lane","Check Khaemenes educational portals","khaemenes",
      "Compare the claim with applicable curriculum, educational standards, and documented teaching resources.",["archive-context","education-context"]));
  }

  if(domain==="historical") {
    tasks.push(task("archive-lane","Deep archive check","arshif",
      "Search archival records, historical context, primary texts, dates, translations, and scholarly context.",["archive-context","education-context"]));
  }

  if(domain==="medical") {
    tasks.push(task("medical-lane","Run Medicament medical evidence lane","medicament",
      "Prefer current systematic reviews, major clinical guidance, regulatory/public-health records, and peer-reviewed evidence. Record limitations and safety context.",["primary-record"]));
  }

  if(domain==="legal") {
    tasks.push(task("legal-lane","Run Firmament legal evidence lane","firmament",
      "Prefer controlling constitutions, statutes, regulations, court opinions, official dockets, and agency records. Distinguish current law from commentary.",["primary-record"]));
  }

  if(domain==="atmospheric") {
    tasks.push(task("atmospheric-lane","Run Solanar observational evidence lane","solanar",
      "Prefer current official warnings, direct observations, radar, satellite, stations, buoys, air-quality monitoring, and clearly identified forecast models.",["primary-record"]));
  }

  if(domain==="news" || claimAnalysis.contested) {
    tasks.push(task("international-lane","Compare international reporting","verifier",
      `Compare geographically independent reporting families where relevant: ${INTERNATIONAL_NEWS_FAMILIES.join(", ")}.`,["independent-check"]));
  }

  if(claimAnalysis.requiresFreshness) {
    tasks.push(task("freshness","Verify dates and current status","verifier",
      "Check publication time, event time, update/correction history, and whether the claim has changed since the cited material.",["primary-record"]));
  }

  const beforeVerdict = tasks
    .filter(t=>t.id!=="claim-split")
    .map(t=>t.id);

  tasks.push(task("contradictions","Actively search for contradiction","verifier",
    "Seek credible evidence that would falsify or materially qualify the claim. Do not search only for confirmation.",["independent-check"]));

  tasks.push(task("verdict","Assign evidence status","verifier",
    "Use claim-by-claim evidence to label the claim verified, strongly/partially supported, disputed, contradicted, outdated, or inconclusive. Search-engine rank is never evidence.",
    [...new Set([...beforeVerdict,"contradictions"])]
  ));

  return {
    domain,
    requirements:req,
    lanes,
    tasks
  };
}
