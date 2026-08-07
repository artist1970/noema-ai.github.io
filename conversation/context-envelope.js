import {inspectMemoryForSecrets} from "../memory/sensitive-memory-filter.js";

function cleanMemory(items=[]) {
  return items.slice(0,8).flatMap(item=>{
    const content=String(item?.content || "");
    const inspection=inspectMemoryForSecrets(content);
    if (!inspection.safeForOrdinaryMemory) return [];
    return [{
      kind:String(item?.kind || "note").slice(0,60),
      title:String(item?.title || "").slice(0,200),
      content:content.slice(0,4000),
      tags:[...(item?.tags || [])].slice(0,12).map(x=>String(x).slice(0,80)),
      confidence:String(item?.confidence || "user-provided").slice(0,80)
    }];
  });
}

export function buildProviderContextEnvelope(context={}) {
  const enrollment=context.enrollment || null;
  const avatar=context.avatar || null;

  return {
    schemaVersion:1,

    // Provider context deliberately excludes internal person IDs,
    // mentor IDs, relationship IDs, birth month/year and avatar appearance.
    userContext: enrollment
      ? {
          ageBand:enrollment.ageBand || "unknown",
          accountPathway:enrollment.accountPathway || "unknown",
          learning:{
            gradeLevel:enrollment.learning?.gradeLevel || "not-applicable",
            learningStage:enrollment.learning?.learningStage || "",
            educationSetting:enrollment.learning?.educationSetting || "independent",
            favoriteSubject:enrollment.learning?.favoriteSubject || "not-sure-yet",
            interests:[...(enrollment.learning?.interests || [])].slice(0,8)
          }
        }
      : null,

    mentor: avatar
      ? {
          displayName:String(avatar.displayName || "").slice(0,60),
          temperament:String(avatar.temperament || "").slice(0,60),
          traits:[...(avatar.traits || [])].slice(0,4),
          collaboration:[...(avatar.collaboration || [])].slice(0,4),
          sharedInterests:[...(avatar.sharedInterests || [])].slice(0,8),
          voice:{
            style:String(avatar.voice?.style || "warm").slice(0,40),
            rate:Number(avatar.voice?.rate)||.95,
            pitch:Number(avatar.voice?.pitch)||1
          }
        }
      : null,

    project: context.project
      ? {
          title:String(context.project.title || "").slice(0,200),
          summary:String(context.project.summary || "").slice(0,4000),
          mode:String(context.project.mode || "").slice(0,60),
          status:String(context.project.status || "").slice(0,60),
          tags:[...(context.project.tags || [])].slice(0,12)
        }
      : null,

    relevantMemory:cleanMemory(context.memory?.relevant || []),

    continuity:Array.isArray(context.continuity)
      ? context.continuity.slice(-8).map(item=>({
          user:String(item?.user || "").slice(0,3000),
          assistant:String(item?.assistant || "").slice(0,3000),
          mode:String(item?.mode || "").slice(0,60)
        }))
      : []
  };
}
