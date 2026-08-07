export const MODULES = Object.freeze({
  hope: {
    id: "hope",
    label: "Hope",
    category: "conversation-lineage",
    purpose: "Legacy companion and Codex lineage; separate from Noema's identity.",
    kind: "external-app",
    url: "https://artist1970.github.io/hope-ai.github.io/"
  },
  moirai: {
    id: "moirai",
    label: "Moirai",
    category: "creative-visual",
    purpose: "Visual ideation, symbolic composition, palettes, and image workflows.",
    kind: "external-app",
    url: "https://artist1970.github.io/Moir_ai.github.io/"
  },
  mentor: {
    id: "mentor",
    label: "Khaemenes Mentor Intelligence",
    category: "family-learning-resources",
    purpose: "Family, learning, ecosystem resource search, eligibility, preference, and freshness policy.",
    kind: "es-module",
    moduleUrl: "https://vervenveda.com/assessment-engine/mentor/index.js"
  },
  sovereign: {
    id: "sovereign",
    label: "Sovereign Agent",
    category: "decision-support",
    purpose: "Constrained ranking and adaptive decision support after eligibility filtering.",
    kind: "es-module",
    moduleUrl: "https://vervenveda.com/assessment-engine/agents/core/sovereign-agent.js"
  },
  prose: {
    id: "prose",
    label: "PROSE",
    category: "writing",
    purpose: "Writing and editing workflows within Verve N Veda.",
    kind: "ecosystem-resource",
    searchTags: ["prose", "writing", "editing"]
  },
  arshif: {
    id: "arshif",
    label: "ARSHIF",
    category: "archive",
    purpose: "Archive, reference, reading, and knowledge pathways.",
    kind: "ecosystem-resource",
    searchTags: ["arshif", "archive", "reading"]
  },
  verifier: {
    id: "verifier",
    label: "The Verifier",
    category: "research",
    purpose: "Fresh/current research and news pathways.",
    kind: "ecosystem-resource",
    searchTags: ["verifier", "news", "research", "current-info"],
    requiresFreshness: true
  },
  pleraSearch: {
    id: "plera-search",
    label: "PLERA Search",
    category: "research",
    purpose: "Research and approved information discovery.",
    kind: "ecosystem-resource",
    searchTags: ["plera-search", "research", "search"],
    requiresFreshness: true
  },
  network333: {
    id: "333",
    label: "333 Network",
    category: "communication",
    purpose: "Account-aware communication and connected services.",
    kind: "ecosystem-resource",
    searchTags: ["333", "hollo", "kansee", "network"],
    requiresAccountAwareness: true
  }
});

export function getModule(id) {
  return MODULES[id] || null;
}

export function listModules(ids = Object.keys(MODULES)) {
  return ids.map(getModule).filter(Boolean);
}
