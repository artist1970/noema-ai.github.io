export const APPROVED_MANIFEST_SOURCES = Object.freeze([
  {
    id:"khaemenes.academy",
    label:"Khaemenes Academy",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/mentor-manifest.json",
    snapshot:"./snapshots/khaemenes-academy.manifest.json",
    tier:"academy",
    priority:30,
    trust:"approved-ecosystem",
    notes:"Central Academy. A current lesson/course/school source should outrank this source when connected."
  },
  {
    id:"verve.arshif",
    label:"ARSHIF Archives",
    url:"https://vervenveda.com/Arshif.github.io/mentor-manifest.json",
    snapshot:"./snapshots/arshif.manifest.json",
    tier:"approved-ecosystem",
    priority:40,
    trust:"approved-ecosystem",
    notes:"Archive/context layer. Preference-gated resources remain gated."
  },
  {
    id:"verve.plera-search",
    label:"PLERA Search",
    url:"https://vervenveda.com/PLERASearch.github.io/mentor-manifest.json",
    snapshot:"./snapshots/plera-search.manifest.json",
    tier:"outer-research",
    priority:60,
    trust:"approved-ecosystem",
    notes:"Outer research layer. Dynamic resources require freshness checks and do not themselves verify a claim."
  }
]);

export function getApprovedManifestSource(id) {
  return APPROVED_MANIFEST_SOURCES.find(item=>item.id===id) || null;
}
