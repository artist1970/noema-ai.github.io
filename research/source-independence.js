import {sourceFamily} from "./source-policy.js";

export function analyzeSourceIndependence(sources=[]) {
  const families = new Map();
  const regions = new Set();
  const jurisdictions = new Set();

  for (const source of sources) {
    const family = sourceFamily(source);
    if (!families.has(family)) families.set(family, []);
    families.get(family).push(source.id || source.title || "source");
    if (source.region) regions.add(String(source.region).toLowerCase());
    if (source.jurisdiction) jurisdictions.add(String(source.jurisdiction).toLowerCase());
  }

  const duplicates = [...families.entries()]
    .filter(([,items])=>items.length>1)
    .map(([family,items])=>({family,count:items.length,items}));

  return {
    sourceCount:sources.length,
    independentFamilyCount:families.size,
    regionCount:regions.size,
    jurisdictionCount:jurisdictions.size,
    duplicateFamilies:duplicates,
    warnings:[
      ...(sources.length && families.size === 1
        ? ["All evidence appears to come from one source family."]
        : []),
      ...(duplicates.length
        ? ["Multiple items may repeat the same underlying publisher, wire service, institution, or source family."]
        : [])
    ]
  };
}

export function geographicDiversitySatisfied(sources=[], minimumRegions=2) {
  const regions = new Set(
    sources.map(s=>String(s.region || s.jurisdiction || "").trim().toLowerCase()).filter(Boolean)
  );
  return regions.size >= minimumRegions;
}
