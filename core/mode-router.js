const MODES = Object.freeze({
  personal: {
    label: "Personal",
    modules: ["sovereign", "mentor"],
    hint: "Think through plans, choices, routines, learning, and next steps."
  },

  family: {
    label: "Family",
    modules: ["mentor", "archaemenes", "resource-director", "sovereign"],
    hint: "Family learning, parent resources, homeschool support, and shared planning."
  },

  learning: {
    label: "Learning",
    modules: ["mentor", "archaemenes", "resource-director", "sovereign", "arshif"],
    hint: "Learn with Archaemenes, discover Academy resources, study, practice, and explore approved references."
  },

  research: {
    label: "Research",
    modules: ["verifier", "plera-search", "resource-director", "arshif", "sovereign"],
    hint: "Search approved research pathways, compare sources, and identify information that needs fresh verification."
  },

  creative: {
    label: "Creative",
    modules: ["zelle", "moirai", "eiren", "prose", "sovereign"],
    hint: "Create across Bazaar Art, The Refrain, poetry and reflection, writing, design, and other creative work."
  },

  work: {
    label: "Work",
    modules: ["prose", "resource-director", "sovereign"],
    hint: "Professional writing, planning, documents, research pathways, and practical resources."
  },

  civic: {
    label: "Civic",
    modules: ["verifier", "plera-search", "resource-director", "sovereign"],
    hint: "Civic learning and current-information pathways with evidence and freshness requirements."
  },

  archive: {
    label: "Archive",
    modules: ["arshif", "resource-director", "mentor"],
    hint: "Find archived writing, reading, references, preserved knowledge, and historical context."
  }
});

export function listModes() {
  return Object.entries(MODES).map(([id, value]) => ({ id, ...value }));
}

export function getMode(id = "personal") {
  const chosen = MODES[id] || MODES.personal;
  return { id: MODES[id] ? id : "personal", ...chosen };
}

export function inferMode(query = "") {
  const q = String(query || "").toLowerCase();

  // Creative disciplines stay in one visible mode; the task planner selects
  // the appropriate specialist underneath it.
  if (
    /draw|drawing|image|visual|palette|art|artwork|bazaar art|design|illustrat|poster|logo|painting|photograph|photography|mixed[- ]media/.test(q) ||
    /music|musical|song|songwriting|melody|harmony|rhythm|compose|composition|arrange|instrument|recording|production|mixing|mastering|refrain/.test(q) ||
    /poem|poetry|poetic|reflection|reflective|story|storytelling|creative writing|lyric|lyrics/.test(q)
  ) return "creative";

  if (/archive|codex|old file|old record|reference|reading room|primary source|manuscript/.test(q)) return "archive";

  if (/child|student|school|academy|lesson|curriculum|parent|homeschool|transcript|diploma|teacher|tutor|homework/.test(q)) return "family";

  if (/vote|voter|government|civic|congress|election|public policy/.test(q)) return "civic";

  if (/research|source|verify|verification|news|latest|current|fact check/.test(q)) return "research";

  if (/work|resume|career|business|project|professional|proposal|document/.test(q)) return "work";

  if (/learn|study|course|practice|explain|tutorial|subject|math|science|history|language arts/.test(q)) return "learning";

  return "personal";
}
