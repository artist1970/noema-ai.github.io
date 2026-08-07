import {educationalGameStatus,queryRequestsGame} from "./educational-game-policy.js";

const STOP=new Set([
  "the","a","an","and","or","to","of","for","in","on","with","me","my","i",
  "is","are","can","help","find","show","give","please","some"
]);

function tokens(text="") {
  return [...new Set(
    String(text || "").toLowerCase()
      .replace(/[^a-z0-9-]+/g," ")
      .split(/\s+/)
      .filter(t=>t.length>1 && !STOP.has(t))
  )].slice(0,36);
}

function haystack(resource={}) {
  return [
    resource.title,resource.description,
    ...(resource.subjects || []),
    ...(resource.learningObjectives || []),
    ...(resource.domains || []),
    ...(resource.skills || []),
    ...(resource.tags || [])
  ].join(" ").toLowerCase();
}

export function scoreFederatedResource(resource,{
  query="",
  mode="personal",
  currentSchoolSourceId="",
  favoriteSubject="",
  currentInfoRequested=false
}={}) {
  const q=tokens(query);
  const hay=haystack(resource);
  const title=String(resource.title || "").toLowerCase();
  let score=100-Number(resource.sourcePriority || 50);
  let matches=0;

  for(const term of q) {
    if(title.includes(term)) {
      score+=14;
      matches++;
    } else if(hay.includes(term)) {
      score+=6;
      matches++;
    }
  }

  if(resource.sourceId===currentSchoolSourceId) score+=34;
  if(resource.featured && !q.length) score+=5;

  if(favoriteSubject && (resource.subjects || []).includes(favoriteSubject)) score+=4;

  if(mode==="learning") {
    if(resource.learningValue==="core") score+=16;
    else if(resource.learningValue==="practice") score+=10;
    else if(resource.learningValue==="supplemental") score+=5;
  }

  const game=educationalGameStatus(resource);
  const wantsGame=queryRequestsGame(query);
  if(game.game) {
    if(game.eligibleForEducationalRanking) score += wantsGame ? 22 : -16;
    else score += wantsGame && matches ? -4 : -45;
  }

  if(resource.resourceType==="course") score+=8;
  if(["quiz","practice","workshop","simulator"].includes(resource.resourceType)) {
    score += /\b(practice|quiz|workshop|simulat|activity)\b/i.test(query) ? 14 : 0;
  }

  if(resource.dynamicContent) {
    score += currentInfoRequested ? 4 : -7;
  }

  // Avoid unrelated extension inventory flooding a specific learning query.
  if(q.length && matches===0 && resource.sourceId!==currentSchoolSourceId) score-=24;

  return {score,matches};
}

export function rankFederatedResources(records=[],options={}) {
  return records
    .map(item=>{
      const ranked=scoreFederatedResource(item,options);
      return {...item,...ranked};
    })
    .sort((a,b)=>b.score-a.score || b.matches-a.matches || a.title.localeCompare(b.title));
}

// Compatibility exports
export function scoreResource(resource,options={}) {
  return scoreFederatedResource(resource,options).score;
}
export function rankResources(records=[],options={}) {
  return rankFederatedResources(records,options);
}
