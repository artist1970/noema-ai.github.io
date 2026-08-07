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
  enrollmentProfile = null,
  mentorRelationship = null,
  query = "",
  provider = null
} = {}) {
  const relevantMemories = retrieveRelevantMemories(memories, {
    query,
    mode,
    activeProject
  }, 8);

  const identityContext = enrollmentProfile
    ? {
        personId: enrollmentProfile.personId,
        displayName: enrollmentProfile.displayName,
        ageBand: enrollmentProfile.ageBand,
        accountPathway: enrollmentProfile.accountPathway,
        learning: {
          gradeLevel: enrollmentProfile.learning?.gradeLevel || "not-applicable",
          learningStage: enrollmentProfile.learning?.learningStage || "",
          educationSetting: enrollmentProfile.learning?.educationSetting || "independent",
          favoriteSubject: enrollmentProfile.learning?.favoriteSubject || "not-sure-yet",
          interests: [...(enrollmentProfile.learning?.interests || [])]
        },
        guardian: enrollmentProfile.guardian || null
      }
    : null;

  return {
    identity: getNoemaIdentity(),
    persona: buildPersonaContext(preferences.persona || {}),
    role,
    mode,
    preferences,

    continuity: Array.isArray(continuity) ? continuity.slice(-12) : [],

    memory: {
      activeCount: Array.isArray(memories)
        ? memories.filter(item => item?.active !== false).length
        : 0,
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

    enrollment: identityContext,

    mentorRelationship: mentorRelationship
      ? {
          relationshipId: mentorRelationship.relationshipId,
          mentorId: mentorRelationship.mentorId,
          relationshipType: mentorRelationship.relationshipType,
          supervisor: mentorRelationship.supervisor
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
