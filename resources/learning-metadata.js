export const RESOURCE_TYPES=Object.freeze([
  "lesson","course","practice","quiz","game","workshop","simulator",
  "tool","reference","archive","portal","resource"
]);

export const LEARNING_VALUES=Object.freeze([
  "core","practice","supplemental","extension","recreational","unknown"
]);

function clean(value,max=160){return String(value || "").trim().slice(0,max)}
function arr(value,max=40){
  return Array.isArray(value)
    ? value.slice(0,max).map(v=>clean(v,120)).filter(Boolean)
    : [];
}

export function deriveResourceType(resource={}) {
  if(RESOURCE_TYPES.includes(resource.resourceType)) return resource.resourceType;
  const title=clean(resource.title).toLowerCase();
  const tags=arr(resource.tags).map(v=>v.toLowerCase());
  const domains=arr(resource.domains).map(v=>v.toLowerCase());

  if(tags.includes("game") || /\bgame\b/.test(title)) return "game";
  if(tags.includes("quiz") || tags.includes("trivia") || /\b(quiz|trivia)\b/.test(title)) return "quiz";
  if(/\bsimulator\b/.test(title) || tags.includes("simulation")) return "simulator";
  if(/\bworkshop\b/.test(title)) return "workshop";
  if(/\b(curriculum|course|class\s+\w*101|class\s+\w*201|class\s+\w*301)\b/.test(title)) return "course";
  if(/\bstudy guide\b/.test(title)) return "reference";
  if(/\b(portal|hub|home|catalog)\b/.test(title) || domains.includes("navigation")) return "portal";
  if(/\b(explorer|studio|planner|tool)\b/.test(title)) return "tool";
  if(/\bpractice\b/.test(title)) return "practice";
  return "resource";
}

export function deriveLearningValue(resource={},source={}) {
  if(LEARNING_VALUES.includes(resource.learningValue)) return resource.learningValue;

  const type=deriveResourceType(resource);
  const skills=arr(resource.skills);
  const domains=arr(resource.domains);

  if(type==="course") return "core";
  if(type==="quiz" || type==="practice") return "practice";

  if(type==="game") {
    // A game is educational only when the source supplies learning skills/objectives.
    return skills.length ? "supplemental" : "unknown";
  }

  if(["tool","simulator"].includes(type) && (skills.length || domains.length)) return "supplemental";
  if(["portal","reference","archive"].includes(type)) return "extension";

  if(source.classification==="educational" && skills.length) return "supplemental";
  return "unknown";
}

export function learningMetadata(resource={},source={}) {
  const resourceType=deriveResourceType(resource);
  const learningObjectives=arr(resource.learningObjectives?.length ? resource.learningObjectives : resource.skills);
  const subjects=arr(resource.subjects?.length ? resource.subjects : resource.domains);
  const learningValue=deriveLearningValue(resource,source);
  const curricularWeight=
    resource.curricularWeight ||
    (learningValue==="core" ? "curricular" :
     learningValue==="practice" ? "practice" :
     learningValue==="supplemental" ? "supplemental" :
     learningValue==="extension" ? "extension" :
     learningValue==="recreational" ? "recreational" : "unclassified");

  return {
    resourceType,
    learningObjectives,
    subjects,
    learningValue,
    curricularWeight,
    highStakesDomain:clean(resource.highStakesDomain,80),
    objectiveProvenance:
      Array.isArray(resource.learningObjectives) && resource.learningObjectives.length
        ? "explicit-resource-metadata"
        : learningObjectives.length
          ? "source-supplied-skills"
          : "not-specified"
  };
}
