import { getNoemaIdentity } from "./identity.js";
import { buildPersonaContext } from "./persona.js";

export function buildNoemaContext({
  role = "adult",
  mode = "personal",
  preferences = {},
  continuity = [],
  provider = null
} = {}) {
  return {
    identity: getNoemaIdentity(),
    persona: buildPersonaContext(preferences.persona || {}),
    role,
    mode,
    preferences,
    continuity: Array.isArray(continuity) ? continuity.slice(-12) : [],
    provider: provider
      ? {
          id: String(provider.id || ""),
          connected: provider.connected === true
        }
      : { id: "", connected: false }
  };
}
