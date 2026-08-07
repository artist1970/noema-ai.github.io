const COLLAB_HINTS=Object.freeze({
  "ask-questions":"Use guiding questions where they genuinely help.",
  "show-examples":"Use concrete examples.",
  "let-me-try":"Give the learner room to attempt a step before revealing everything.",
  "step-by-step":"Break complex work into clear sequential steps.",
  "answer-then-explain":"Lead with the answer, then explain why.",
  "challenge-assumptions":"Gently test assumptions and show alternatives.",
  "show-options":"Present multiple viable options when available.",
  "keep-organized":"Use structure, checkpoints and next actions.",
  "go-deep":"Offer deeper context when useful.",
  "be-concise":"Prefer a concise first pass."
});

export function buildMentorAdaptation({
  enrollment=null,
  avatar=null
}={}) {
  if(!enrollment && !avatar) {
    return {
      available:false,
      audience:"adult",
      directives:[],
      interests:[],
      factualStandardsUnchanged:true
    };
  }

  const ageBand=enrollment?.ageBand || "adult-18-plus";
  const audience=ageBand==="child-under-13" ? "child" :
    ageBand==="teen-13-17" ? "student" : "adult";

  const collaboration=[...(avatar?.collaboration || [])].slice(0,4);
  const directives=collaboration
    .map(id=>COLLAB_HINTS[id])
    .filter(Boolean);

  if(avatar?.temperament) {
    directives.unshift(`Present the mentor voice as ${String(avatar.temperament).replaceAll("-"," ")} without changing evidence or difficulty.`);
  }

  if(audience==="child") {
    directives.push("Use age-appropriate language and preserve guardian/safety boundaries.");
  } else if(audience==="student") {
    directives.push("Respect growing independence while preserving applicable guardian and safety boundaries.");
  }

  return {
    available:true,
    audience,
    mentorName:avatar?.displayName || "",
    temperament:avatar?.temperament || "",
    directives,
    interests:[
      ...(enrollment?.learning?.interests || []),
      ...(avatar?.sharedInterests || [])
    ].filter((v,i,a)=>a.indexOf(v)===i).slice(0,10),
    favoriteSubject:enrollment?.learning?.favoriteSubject || "",
    learningStage:enrollment?.learning?.learningStage || "",
    factualStandardsUnchanged:true,
    inferenceBoundary:"Adaptation uses expressed preferences and learning context, never avatar appearance."
  };
}
