export const SOVEREIGN_MODULE_URL =
  "https://vervenveda.com/assessment-engine/agents/core/sovereign-agent.js";

export async function loadSovereignAgent() {
  try {
    const mod = await import(SOVEREIGN_MODULE_URL);
    return mod.SovereignProblemSolvingAgent || mod.default || mod;
  } catch (error) {
    return {
      unavailable: true,
      moduleUrl: SOVEREIGN_MODULE_URL,
      error: String(error?.message || error)
    };
  }
}
