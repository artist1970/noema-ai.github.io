export const FEDERATION_SOURCE_KINDS = Object.freeze({
  SOURCE_MANIFEST:"source-owned-manifest",
  ADMIN_INVENTORY:"noema-approved-inventory-snapshot"
});

export const LEARNING_FEDERATION_SOURCES = Object.freeze([
  {
    id:"khaemenes.preschool",label:"Khaemenes Preschool · Crechè",
    url:"https://vervenveda.com/Khaemenes_Preschool.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"preschool",priority:8
  },
  {
    id:"khaemenes.kindergarten",label:"Khaemenes Kinder Garden",
    url:"https://vervenveda.com/Khaemenes_KinderGarden.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"kindergarten",priority:8
  },
  {
    id:"khaemenes.elementary",label:"Khaemenes Elementary",
    url:"https://vervenveda.com/Khaemenes_Elementary.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"elementary",priority:8
  },
  {
    id:"khaemenes.middle",label:"Khaemenes Middle School",
    url:"https://vervenveda.com/Khaemenes_Middle.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"middle",priority:8
  },
  {
    id:"khaemenes.high",label:"Khaemenes Academy High School",
    url:"https://vervenveda.com/Khaemenes_High.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"high",priority:8
  },
  {
    id:"khaemenes.higher-learning",label:"Khaemenes Higher Learning",
    url:"https://vervenveda.com/Khaemenes_Higher_Learning.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"current-school",stage:"higher-learning",priority:8
  },
  {
    id:"khaemenes.linguistics",label:"Khaemenes Linguistics · Polyglot",
    url:"https://vervenveda.com/Khaemenes_Linguistics.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"academy-extension",stage:"cross-stage",priority:22
  },
  {
    id:"khaemenes.academy",label:"Khaemenes Academy",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"academy",stage:"cross-stage",priority:28
  },
  {
    id:"verve.finance",label:"Verve N Veda Finance",
    url:"",
    sourceKind:FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY,
    tier:"learning-extension",stage:"cross-stage",priority:36
  },
  {
    id:"verve.medicament",label:"Medicament Hub",
    url:"",
    sourceKind:FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY,
    tier:"learning-extension",stage:"cross-stage",priority:36,
    highStakesDomain:"medical"
  },
  {
    id:"verve.bazaar-art",label:"Bazaar Art",
    url:"",
    sourceKind:FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY,
    tier:"learning-extension",stage:"cross-stage",priority:36
  },
  {
    id:"verve.arshif",label:"ARSHIF Archives",
    url:"https://vervenveda.com/Arshif.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"archive-extension",stage:"cross-stage",priority:42
  },
  {
    id:"verve.arcade-learning",label:"Arcade · Learning Selection",
    url:"",
    sourceKind:FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY,
    tier:"educational-games",stage:"cross-stage",priority:50
  },
  {
    id:"verve.plera-search",label:"PLERA Search",
    url:"https://vervenveda.com/PLERASearch.github.io/mentor-manifest.json",
    sourceKind:FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,
    tier:"outer-research",stage:"cross-stage",priority:65
  }
]);

export const STAGE_SOURCE_IDS=Object.freeze({
  preschool:"khaemenes.preschool",
  kindergarten:"khaemenes.kindergarten",
  elementary:"khaemenes.elementary",
  middle:"khaemenes.middle",
  high:"khaemenes.high",
  "higher-learning":"khaemenes.higher-learning"
});

export function federationSource(id){
  return LEARNING_FEDERATION_SOURCES.find(s=>s.id===id) || null;
}

export function sourceForAudience(audience="adult"){
  if(audience==="adult") return "khaemenes.higher-learning";
  return STAGE_SOURCE_IDS[audience] || null;
}
