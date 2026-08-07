export const MOIRAI_URL = "https://artist1970.github.io/Moir_ai.github.io/";

export function createMoiraiHandoff({
  prompt = "",
  theme = "",
  mood = "",
  palette = ""
} = {}) {
  return {
    module: "moirai",
    url: MOIRAI_URL,
    brief: {
      prompt: String(prompt || ""),
      theme: String(theme || ""),
      mood: String(mood || ""),
      palette: String(palette || "")
    },
    note:
      "Moirai currently provides procedural visual generation. Future adapters may connect a true image model."
  };
}
