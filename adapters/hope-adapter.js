export const HOPE_URL = "https://artist1970.github.io/hope-ai.github.io/";

export function createHopeHandoff({ prompt = "" } = {}) {
  return {
    module: "hope",
    url: HOPE_URL,
    prompt: String(prompt || ""),
    inheritedMemory: false,
    note:
      "Hope is a distinct legacy companion/Codex lineage. Noema does not silently inherit Founder-specific Hope memory."
  };
}
