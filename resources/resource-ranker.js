const STOP=new Set(["the","a","an","and","or","to","of","for","in","on","with","me","my","i","is","are","can","help","find"]);

function tokens(text="") {
  return [...new Set(
    String(text || "").toLowerCase()
      .replace(/[^a-z0-9-]+/g," ")
      .split(/\s+/)
      .filter(t=>t.length>1 && !STOP.has(t))
  )].slice(0,30);
}

function haystack(resource={}) {
  return [
    resource.title,resource.description,
    ...(resource.domains || []),
    ...(resource.skills || []),
    ...(resource.tags || [])
  ].join(" ").toLowerCase();
}

export function scoreResource(resource,{
  query="",
  sourcePriority=50,
  mode="personal",
  currentInfoRequested=false
}={}) {
  const q=tokens(query);
  const hay=haystack(resource);
  let score=100-sourcePriority;

  for(const term of q) {
    if(String(resource.title || "").toLowerCase().includes(term)) score+=12;
    else if(hay.includes(term)) score+=5;
  }

  if(resource.featured) score+=3;
  if(mode==="learning" && resource.domains?.includes("education")) score+=7;
  if(mode==="archive" && resource.domains?.some(d=>["archives","history","reading"].includes(d))) score+=7;
  if(mode==="research" && resource.domains?.includes("research")) score+=7;

  if(resource.dynamicContent) {
    score += currentInfoRequested ? 4 : -4;
  }

  return score;
}

export function rankResources(records=[],options={}) {
  return records
    .map(item=>({...item,score:scoreResource(item,options)}))
    .sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title));
}
