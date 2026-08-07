const MODES = Object.freeze({
  personal: {
    label: "Personal",
    modules: ["sovereign", "mentor"],
    hint: "Think through plans, choices, routines, learning, and next steps."
  },
  family: {
    label: "Family",
    modules: ["mentor", "sovereign"],
    hint: "Family learning, parent resources, homeschool support, and shared planning."
  },
  learning: {
    label: "Learning",
    modules: ["mentor", "sovereign", "arshif"],
    hint: "Find courses, lessons, tools, explanations, and approved learning resources."
  },
  research: {
    label: "Research",
    modules: ["mentor", "verifier", "pleraSearch", "sovereign"],
    hint: "Search approved research pathways and identify information that needs fresh verification."
  },
  creative: {
    label: "Creative",
    modules: ["moirai", "prose", "sovereign"],
    hint: "Develop visual concepts, writing, palettes, creative direction, and variations."
  },
  work: {
    label: "Work",
    modules: ["mentor", "prose", "sovereign"],
    hint: "Professional tools, writing, planning, documents, and practical resources."
  },
  civic: {
    label: "Civic",
    modules: ["mentor", "verifier", "pleraSearch", "sovereign"],
    hint: "Civic learning and current-information pathways with freshness requirements."
  },
  archive: {
    label: "Archive",
    modules: ["arshif", "mentor"],
    hint: "Find archived writing, reading, references, and preserved knowledge."
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

  if (/draw|image|visual|palette|art|design|illustrat|poster|logo/.test(q)) return "creative";
  if (/archive|codex|old file|reference|reading room/.test(q)) return "archive";
  if (/child|student|school|lesson|curriculum|parent|homeschool|transcript|diploma/.test(q)) return "family";
  if (/vote|voter|government|civic|congress|election|public policy/.test(q)) return "civic";
  if (/research|source|verify|news|latest|current|fact check/.test(q)) return "research";
  if (/work|resume|career|business|project|professional|proposal/.test(q)) return "work";
  if (/learn|study|course|practice|explain|tutorial/.test(q)) return "learning";

  return "personal";
}
