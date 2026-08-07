export const EVIDENCE_LANES = Object.freeze([
  {
    id:"arshif",
    name:"ARSHIF Archives",
    kind:"archive-and-context",
    repository:"vervenveda/Arshif.github.io",
    url:"https://vervenveda.com/Arshif.github.io/",
    domains:["historical","science","legal","medical","education","general"],
    roles:["archive-context","source-discovery","historical-records"],
    privilegedTruth:false,
    notes:"Useful for historical context, source literacy, primary/secondary distinctions and archival pathways. Must still be independently checked for consequential claims."
  },
  {
    id:"khaemenes",
    name:"Khaemenes Educational Portals",
    kind:"educational",
    repository:"vervenveda/Khaemenes_Academy.github.io",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/",
    domains:["education","science","historical","general"],
    roles:["curriculum-context","teaching-reference","student-safe-explanation"],
    privilegedTruth:false,
    notes:"Educational context and vetted learning material; not a substitute for primary evidence."
  },
  {
    id:"verifier",
    name:"The Verifier",
    kind:"verification-and-news",
    repository:"vervenveda/theverifier.github.io",
    url:"https://vervenveda.com/theverifier.github.io/",
    domains:["news","general","science","legal","medical","historical","atmospheric"],
    roles:["source-comparison","international-news","media-literacy","current-events"],
    privilegedTruth:false,
    notes:"Supports source comparison and international discovery. Editorial/commentary content must remain distinct from verified evidence."
  },
  {
    id:"medicament",
    name:"Medicament Hub",
    kind:"medical-research",
    repository:"vervenveda/medicament-hub.github.io",
    url:"https://vervenveda.com/medicament-hub.github.io/",
    domains:["medical"],
    roles:["medical-source-discovery","health-literacy","safety-context"],
    privilegedTruth:false,
    notes:"Evidence-first health gateway. Clinical claims require current high-quality medical evidence and appropriate professional caution."
  },
  {
    id:"firmament",
    name:"Firmament Law",
    kind:"legal-research",
    repository:"vervenveda/firmament.github.io",
    url:"https://vervenveda.com/firmament.github.io/",
    domains:["legal"],
    roles:["legal-source-discovery","evidence-analysis","public-record-navigation"],
    privilegedTruth:false,
    notes:"Legal research gateway. Current law must be confirmed against controlling official legal authority."
  },
  {
    id:"solanar",
    name:"Solanar Atmospheric & Space Systems",
    kind:"atmospheric-observation",
    repository:"vervenveda/solanar.github.io",
    url:"https://vervenveda.com/solanar.github.io/",
    domains:["atmospheric","science"],
    roles:["weather-observation","satellite","space-weather","environmental-data"],
    privilegedTruth:false,
    notes:"Atmospheric research lane. Prefer direct observations and current official warnings for safety-critical weather claims."
  },
  {
    id:"evidence-studio",
    name:"Evidence & Citation Studio",
    kind:"research-provenance",
    repository:"vervenveda/proresource_hub.github.io",
    url:"https://vervenveda.com/proresource_hub.github.io/Protools/Evidence_Citation_Studio/",
    domains:["general","news","historical","science","medical","legal","atmospheric","education"],
    roles:["claim-tracking","citation","provenance","evidence-matrix"],
    privilegedTruth:false,
    notes:"Preserves claim/source/evidence relationships; intentionally does not decide truth by itself."
  }
]);

export const INTERNATIONAL_NEWS_FAMILIES = Object.freeze([
  "global wire services",
  "North American reporting",
  "European reporting",
  "Middle Eastern reporting",
  "African reporting",
  "Asian reporting",
  "Latin American reporting",
  "Oceanian reporting"
]);

export function lanesForDomain(domain="general") {
  const exact = EVIDENCE_LANES.filter(lane=>lane.domains.includes(domain));
  const general = EVIDENCE_LANES.filter(lane=>lane.domains.includes("general"));
  const merged = [...exact, ...general];
  return [...new Map(merged.map(lane=>[lane.id,lane])).values()];
}
