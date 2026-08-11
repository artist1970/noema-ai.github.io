function has(text,re){return re.test(String(text || ""))}
function task(id,label,specialistId,purpose,requires=[]) {
  return {id,label,specialistId,purpose,requires,status:"pending"};
}

export function buildTaskPlan({
  message="",
  route={},
  researchDecision={required:false},
  context={}
}={}) {
  const mode=route.mode?.id || "personal";
  const q=String(message || "");

  const tasks=[
    task(
      "understand",
      "Understand the request",
      "noema",
      "Identify the user's goal, constraints, role, current mode and relevant context."
    )
  ];

  const needsPlanning =
    ["work","personal","family"].includes(mode) ||
    has(q,/\b(plan|organize|decide|compare|priorit|choose|strategy|steps?)\b/i);

  const needsWriting =
    ["work"].includes(mode) ||
    has(q,/\b(write|draft|edit|rewrite|letter|email|essay|article|post|proposal|script)\b/i);

  const needsVisual =
    has(q,/\b(draw|drawing|image|visual|design|art|artwork|poster|logo|palette|illustrat|painting|photograph|photography|mixed[- ]media|creative block|creative idea)\b/i);

  const needsMusic =
    has(q,/\b(music|musical|song|songwriting|melody|melodic|harmony|chord|rhythm|beat|tempo|meter|compose|composition|arrange|arrangement|instrument|instrumentation|orchestration|music theory|ear training|practice|rehearsal|performance|recording|production|mixing|mastering)\b/i);

  const needsReflectionCreative =
    has(q,/\b(poem|poetry|poetic|reflection|reflective|journal|journaling|story|storytelling|creative writing|lyric|lyrics|songwriting|meditation writing|personal reflection)\b/i);

  const needsLearning =
    ["learning","family"].includes(mode) ||
    has(q,/\b(learn|teach|study|lesson|curriculum|student|homework|practice|explain)\b/i);

  const needsAcademic =
    ["learning","family"].includes(mode) ||
    has(q,/\b(academic|academy|school|student|teacher|tutor|tutoring|lesson|curriculum|homework|study|course|subject|math|mathematics|science|history|social studies|language arts|english|reading|writing assignment|research paper|exam|test|quiz)\b/i);

  const needsArchive =
    mode==="archive" ||
    has(q,/\b(archive|histor|reference|old record|primary source|manuscript)\b/i);

  const needsResources =
    ["learning","research","archive","family"].includes(mode) ||
    has(q,/\b(find|resource|lesson|course|study|learn|research|search|archive|reading|tool|practice)\b/i);

  if(researchDecision.required) {
    tasks.push(task(
      "verify",
      "Build evidence requirements",
      "verifier",
      "Create the Verifier session, domain requirements, evidence lanes, freshness requirements and contradiction check.",
      ["understand"]
    ));
  }

  if(needsResources) {
    tasks.push(task(
      "resources",
      "Discover federated learning resources",
      "resource-director",
      "Search the learner's Khaemenes stage first, then Academy courses, approved workshops and learning extensions, educational games, archives, and PLERA research with audience, preference, provenance, curriculum-weight, and freshness rules.",
      [researchDecision.required ? "verify" : "understand"]
    ));
  }

  if(needsLearning) {
    tasks.push(task(
      "mentor",
      "Adapt for learner and mentor",
      "mentor",
      "Use learning stage, interests, collaboration preferences and adopted mentor traits to shape presentation without changing factual standards.",
      ["understand"]
    ));
  }

  if(needsAcademic) {
    tasks.push(task(
      "academic",
      "Prepare academic mentor handoff",
      "archaemenes",
      "Prepare an age-responsive Archaemenes academic handoff for teaching, tutoring, curriculum, scholarship, or study while preserving institutional and verification boundaries.",
      [researchDecision.required ? "verify" : "understand"]
    ));
  }

  if(needsPlanning) {
    tasks.push(task(
      "decision",
      "Structure options and next steps",
      "sovereign",
      "Organize criteria, tradeoffs, dependencies and reversible next steps without taking consequential action.",
      ["understand"]
    ));
  }

  if(needsArchive) {
    tasks.push(task(
      "archive",
      "Prepare archival/context handoff",
      "arshif",
      "Prepare an ARSHIF context pathway and record that archival material still requires provenance review.",
      [researchDecision.required ? "verify" : "understand"]
    ));
  }

  if(needsWriting) {
    tasks.push(task(
      "writing",
      "Prepare writing handoff",
      "prose",
      "Prepare a bounded PROSE handoff using the user's goal, tone and available project context.",
      ["understand"]
    ));
  }

  if(needsVisual) {
    tasks.push(task(
      "visual",
      "Prepare creative guidance handoff",
      "zelle",
      "Prepare a bounded Zelle creative-guidance handoff for visual art, design, photography, mixed media, or idea development while preserving creator authorship.",
      ["understand"]
    ));
  }

  if(needsMusic) {
    tasks.push(task(
      "music",
      "Prepare music mentor handoff",
      "moirai",
      "Prepare a bounded Moirai music-mentor handoff for melody, harmony, rhythm, songwriting, composition, arrangement, theory, practice, performance preparation, recording, production, or music research.",
      ["understand"]
    ));
  }

  if(needsReflectionCreative) {
    tasks.push(task(
      "reflection",
      "Prepare reflective creative handoff",
      "eiren",
      "Prepare a bounded Eiren handoff for poetry, reflection, storytelling, lyrics, songwriting, or creative companionship while preserving the user's authorship.",
      ["understand"]
    ));
  }

  const dependencies=tasks
    .map(t=>t.id)
    .filter(id=>id!=="understand");

  tasks.push(task(
    "synthesize",
    "Synthesize the coordinated response",
    "noema",
    "Combine completed local specialist results, Verifier status, provider output, and honest handoff/unavailable states.",
    dependencies.length ? dependencies : ["understand"]
  ));

  return {
    schemaVersion:2,
    goal:q.slice(0,1000),
    mode,
    project:context.project
      ? {
          title:context.project.title || "",
          status:context.project.status || ""
        }
      : null,
    tasks
  };
}
