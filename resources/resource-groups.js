export const RESOURCE_GROUPS=Object.freeze([
  {id:"school",label:"From your school"},
  {id:"academy",label:"Academy courses & lessons"},
  {id:"practice",label:"Practice & workshops"},
  {id:"games",label:"Educational games"},
  {id:"extensions",label:"Archives & learning extensions"},
  {id:"research",label:"Research layer"}
]);

export function resourceGroup(resource={},currentSchoolSourceId="") {
  if(resource.sourceId===currentSchoolSourceId) return "school";
  if(resource.sourceTier==="outer-research") return "research";
  if(resource.resourceType==="game") return "games";
  if(["practice","quiz","workshop","simulator","tool"].includes(resource.resourceType))
    return "practice";
  if(["academy","academy-extension"].includes(resource.sourceTier) ||
     (resource.sourceId || "").startsWith("khaemenes."))
    return "academy";
  return "extensions";
}

export function groupResources(results=[],currentSchoolSourceId="") {
  return RESOURCE_GROUPS.map(group=>({
    ...group,
    results:results.filter(r=>resourceGroup(r,currentSchoolSourceId)===group.id)
  })).filter(group=>group.results.length);
}
