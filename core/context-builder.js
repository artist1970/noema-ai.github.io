import { getNoemaIdentity } from "./identity.js";
import { buildPersonaContext } from "./persona.js";
import { retrieveRelevantMemories } from "../memory/memory-retriever.js";

export function buildNoemaContext({
  role = "adult",
  mode = "personal",
  preferences = {},
  continuity = [],
  memories = [],
  activeProject = null,
  query = "",
  provider = null
} = {}) {
  const relevantMemories = retrieveRelevantMemories(memories, {
    query,
    mode,
    activeProject
  }, 8);

  return {
    identity: getNoemaIdentity(),
    persona: buildPersonaContext(preferences.persona || {}),
    role,
    mode,
    preferences,

    // Short-term continuity: bounded conversational buffer.
    continuity: Array.isArray(continuity) ? continuity.slice(-12) : [],

    // Long-term memory: only explicitly saved items relevant to this context.
    memory: {
      activeCount: Array.isArray(memories) ? memories.filter(item => item?.active !== false).length : 0,
      relevant: relevantMemories
    },

    project: activeProject
      ? {
          id: activeProject.id,
          title: activeProject.title,
          summary: activeProject.summary,
          mode: activeProject.mode,
          status: activeProject.status,
          tags: [...(activeProject.tags || [])]
        }
      : null,

    provider: provider
      ? {
          id: String(provider.id || ""),
          connected: provider.connected === true
        }
      : { id: "", connected: false }
  };
}
