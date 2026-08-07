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
    task("understand","Understand the request","noema",
      "Identify the user's goal, constraints, role, current mode and relevant context.")
  ];

  const needsPlanning =
    ["work","personal","family"].includes(mode) ||
    has(q,/\b(plan|organize|decide|compare|priorit|choose|strategy|steps?)\b/i);

  const needsWriting =
    ["work"].includes(mode) ||
    has(q,/\b(write|draft|edit|rewrite|letter|email|essay|article|post|proposal|script)\b/i);

  const needsCreative =
    mode==="creative" ||
    has(q,/\b(draw|image|visual|design|art|poster|logo|palette|illustrat)\b/i);

  const needsLearning =
    ["learning","family"].includes(mode) ||
    has(q,/\b(learn|teach|study|lesson|curriculum|student|homework|practice|explain)\b/i);

  const needsArchive =
    mode==="archive" ||
    has(q,/\b(archive|histor|reference|old record|primary source|manuscript)\b/i);

  const needsResources =
    ["learning","research","archive","family"].includes(mode) ||
    has(q,/\b(find|resource|lesson|course|study|learn|research|search|archive|reading|tool|practice)\b/i);

  if(researchDecision.required) {
    tasks.push(task("verify","Build evidence requirements","verifier",
      "Create the Verifier session, domain requirements, evidence lanes, freshness requirements and contradiction check.",
      ["understand"]));
  }

  if(needsResources) {
    tasks.push(task("resources","Discover approved resources","resource-director",
      "Search the approved Khaemenes Academy, ARSHIF, and PLERA Search manifests with audience, preference, hierarchy, provenance, and freshness rules.",
      [researchDecision.required ? "verify" : "understand"]));
  }

  if(needsLearning) {
    tasks.push(task("mentor","Adapt for learner and mentor","mentor",
      "Use learning stage, interests, collaboration preferences and adopted mentor traits to shape presentation without changing factual standards.",
      ["understand"]));
  }

  if(needsPlanning) {
    tasks.push(task("decision","Structure options and next steps","sovereign",
      "Organize criteria, tradeoffs, dependencies and reversible next steps without taking consequential action.",
      ["understand"]));
  }

  if(needsArchive) {
    tasks.push(task("archive","Prepare archival/context handoff","arshif",
      "Prepare an ARSHIF context pathway and record that archival material still requires provenance review.",
      [researchDecision.required ? "verify" : "understand"]));
  }

  if(needsWriting) {
    tasks.push(task("writing","Prepare writing handoff","prose",
      "Prepare a bounded PROSE handoff using the user's goal, tone and available project context.",
      ["understand"]));
  }

  if(needsCreative) {
    tasks.push(task("visual","Prepare visual handoff","moirai",
      "Prepare a bounded Moirai creative brief without claiming an external visual system executed.",
      ["understand"]));
  }

  const dependencies=tasks.map(t=>t.id).filter(id=>id!=="understand");
  tasks.push(task("synthesize","Synthesize the coordinated response","noema",
    "Combine completed local specialist results, Verifier status, provider output, and honest handoff/unavailable states.",
    dependencies.length ? dependencies : ["understand"]));

  return {
    schemaVersion:1,
    goal:q.slice(0,1000),
    mode,
    project:context.project
      ? {title:context.project.title || "",status:context.project.status || ""}
      : null,
    tasks
  };
}
