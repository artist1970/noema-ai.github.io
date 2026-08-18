/**
 * NAIB Mentor Router
 *
 * Noema (private Chancellor) -> NAIB (Administrator) -> Mentor
 *
 * Phase 1 intentionally enables only mentor adapters that have been
 * individually verified. Registration does not imply routability.
 *
 * This module does not import CORE material, hold credentials, or perform
 * remote execution. It returns bounded handoff objects.
 */
import { createEirenHandoff, detectEirenDomains } from "../adapters/eiren-adapter.js";
import { createMoiraiHandoff } from "../adapters/moirai-adapter.js";

export const ROUTABLE_MENTORS = Object.freeze(["eiren", "moirai"]);

const MUSIC = /\b(music|musical|song|songwriting|melody|harmony|rhythm|chord|compose|composition|arrange|arrangement|theory|ear training|practice|performance|production|recording)\b/i;

export function detectMentorIntent(prompt="") {
  const text = String(prompt || "");
  const eirenDomains = detectEirenDomains(text);
  const music = MUSIC.test(text);

  // Do not silently choose between competing specialists.
  if (music && eirenDomains.length) {
    return Object.freeze({
      status:"ambiguous",
      candidates:["moirai","eiren"],
      reason:"request-matches-multiple-verified-mentors"
    });
  }

  if (music) {
    return Object.freeze({status:"matched", specialist:"moirai"});
  }

  if (eirenDomains.length) {
    return Object.freeze({
      status:"matched",
      specialist:"eiren",
      domains:eirenDomains
    });
  }

  return Object.freeze({
    status:"unmatched",
    candidates:ROUTABLE_MENTORS,
    reason:"no-verified-specialist-match"
  });
}

export function createMentorHandoff({
  specialist,
  prompt="",
  context={},
  source="naib",
  requestedMode=null
}={}) {
  const id = String(specialist || "").trim().toLowerCase();

  if (id === "eiren") {
    return createEirenHandoff({prompt, context, source, requestedMode});
  }

  if (id === "moirai") {
    // Preserve Moirai's existing adapter as the authority for her handoff.
    return createMoiraiHandoff({prompt, context, source, requestedMode});
  }

  return {
    status:"not-routable",
    administrator:"NAIB",
    requestedSpecialist:id || null,
    routableMentors:ROUTABLE_MENTORS,
    reason:"mentor-is-not-yet-backed-by-a-verified-handoff-adapter"
  };
}

export function routeMentorRequest({
  prompt="",
  context={},
  source="naib",
  requestedMode=null,
  specialist=null
}={}) {
  if (specialist) {
    return createMentorHandoff({specialist,prompt,context,source,requestedMode});
  }

  const match = detectMentorIntent(prompt);

  if (match.status !== "matched") {
    return {
      ...match,
      administrator:"NAIB",
      requiresUserChoice:match.status === "ambiguous"
    };
  }

  return createMentorHandoff({
    specialist:match.specialist,
    prompt,
    context,
    source,
    requestedMode
  });
}

export default {
  routableMentors:ROUTABLE_MENTORS,
  detectIntent:detectMentorIntent,
  createHandoff:createMentorHandoff,
  route:routeMentorRequest
};
