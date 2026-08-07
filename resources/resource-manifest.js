import {learningMetadata} from "./learning-metadata.js";

function text(value,max=800){return String(value || "").trim().slice(0,max)}
function arr(value,max=40){return Array.isArray(value) ? value.slice(0,max).map(v=>text(v,120)).filter(Boolean) : []}

export function normalizeResourceRecord(resource={},source={}) {
  const url=text(resource.url,1800);
  let validUrl=false;
  try {
    const u=new URL(url);
    validUrl=u.protocol==="https:";
  } catch {}

  const base={
    id:text(resource.id,180),
    title:text(resource.title,300),
    description:text(resource.description,1200),
    url:validUrl ? url : "",
    audiences:arr(resource.audiences),
    roles:arr(resource.roles),
    domains:arr(resource.domains),
    skills:arr(resource.skills),
    tags:arr(resource.tags),
    mentorEligible:resource.mentorEligible===true,
    featured:resource.featured===true,
    minutes:Number.isFinite(Number(resource.minutes)) ? Math.max(1,Math.min(360,Number(resource.minutes))) : null,
    energy:text(resource.energy,80),
    requiresPreferenceMatch:arr(resource.requiresPreferenceMatch,12),
    requiresFreshnessCheck:resource.requiresFreshnessCheck===true,
    dynamicContent:resource.dynamicContent===true,
    sourceId:text(source.sourceId,180),
    sourceName:text(source.name,240),
    sourceClassification:text(source.classification,120),

    // Optional source/admin metadata. The learningMetadata() function never
    // invents an objective when neither learningObjectives nor skills exist.
    resourceType:text(resource.resourceType,80),
    learningValue:text(resource.learningValue,80),
    curricularWeight:text(resource.curricularWeight,80),
    learningObjectives:arr(resource.learningObjectives),
    subjects:arr(resource.subjects),
    highStakesDomain:text(resource.highStakesDomain,80)
  };

  return {...base,...learningMetadata({...resource,...base},source)};
}

export function normalizeResourceManifest(raw={}) {
  const source={
    version:Number(raw.version)||1,
    sourceId:text(raw.sourceId,180),
    name:text(raw.name,240),
    classification:text(raw.classification,120),
    mentorSearchable:raw.mentorSearchable===true,
    audiences:arr(raw.audiences),
    roles:arr(raw.roles),
    homepage:text(raw.homepage,1800),
    repository:text(raw.repository,300),
    mentorNotes:text(raw.mentorNotes,2400),
    inventoryAuthority:text(raw.inventoryAuthority,120)
  };

  return {
    ...source,
    resources:Array.isArray(raw.resources)
      ? raw.resources.slice(0,800)
          .map(item=>normalizeResourceRecord(item,source))
          .filter(item=>item.id && item.title && item.url)
      : []
  };
}

export function resourceManifestValid(manifest={}) {
  return Boolean(
    manifest.sourceId &&
    manifest.name &&
    manifest.mentorSearchable===true &&
    Array.isArray(manifest.resources)
  );
}
