import {KHAEMENES_ACADEMY_SNAPSHOT,ARSHIF_SNAPSHOT,PLERA_SEARCH_SNAPSHOT} from "./snapshots/manifest-snapshots.js";
import {APPROVED_MANIFEST_SOURCES} from "./approved-manifest-sources.js";
import {ResourceManifestLoader} from "./resource-manifest-loader.js";
import {audienceFromEnrollment,roleFromEnrollment,explicitPreferenceTerms,checkResourceEligibility} from "./resource-eligibility.js";
import {rankResources} from "./resource-ranker.js";
import {RESOURCE_EXECUTION_STATES} from "./execution-state.js";

const SNAPSHOTS={
  "khaemenes.academy":KHAEMENES_ACADEMY_SNAPSHOT,
  "verve.arshif":ARSHIF_SNAPSHOT,
  "verve.plera-search":PLERA_SEARCH_SNAPSHOT
};

function currentInfoRequested(query="",mode="personal") {
  return mode==="research" || /\b(current|latest|today|now|news|recent|updated|fresh)\b/i.test(String(query || ""));
}

export class ResourceDirector {
  constructor({fetchImpl}={}) {
    this.loaders=new Map(
      APPROVED_MANIFEST_SOURCES.map(source=>[
        source.id,
        new ResourceManifestLoader({
          source,
          snapshot:SNAPSHOTS[source.id],
          fetchImpl
        })
      ])
    );
    this.lastRefresh=null;
  }

  async refresh({allowNetwork=true,timeoutMs=3500}={}) {
    const results=await Promise.all(
      [...this.loaders.values()].map(loader=>loader.refresh({allowNetwork,timeoutMs}))
    );
    this.lastRefresh=new Date().toISOString();
    return results.map(item=>item.provenance);
  }

  sourceStatus() {
    return [...this.loaders.entries()].map(([id,loader])=>{
      const current=loader.get();
      return {
        id,
        resourceCount:current.manifest.resources.length,
        provenance:current.provenance
      };
    });
  }

  discover({
    query="",
    mode="personal",
    context={},
    sourceIds=null,
    maxResults=8
  }={}) {
    const audience=audienceFromEnrollment(context.enrollment);
    const role=roleFromEnrollment(context.enrollment);
    const preferenceTerms=explicitPreferenceTerms({query,context});
    const sourceFilter=Array.isArray(sourceIds) && sourceIds.length ? new Set(sourceIds) : null;
    const currentRequested=currentInfoRequested(query,mode);

    const eligible=[];
    const withheld=[];

    for(const source of APPROVED_MANIFEST_SOURCES) {
      if(sourceFilter && !sourceFilter.has(source.id)) continue;
      const loader=this.loaders.get(source.id);
      const {manifest,provenance}=loader.get();

      for(const resource of manifest.resources) {
        const eligibility=checkResourceEligibility(resource,{audience,role,preferenceTerms});
        const record={
          ...resource,
          sourceTier:source.tier,
          sourcePriority:source.priority,
          manifestProvenance:provenance.mode,
          manifestRefreshedAt:provenance.refreshedAt,
          executionState:RESOURCE_EXECUTION_STATES.DISCOVERED,
          verified:false,
          freshnessStatus:resource.requiresFreshnessCheck ? "required" : "not-required"
        };

        if(eligibility.eligible) eligible.push(record);
        else withheld.push({
          id:resource.id,
          sourceId:resource.sourceId,
          reasons:eligibility.reasons
        });
      }
    }

    const ranked=rankResources(eligible,{
      query,mode,currentInfoRequested:currentRequested
    }).map(record=>({
      ...record,
      score:scoreWithPriority(record)
    })).sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title));

    function scoreWithPriority(record) {
      // rankResources has already scored with defaults; reapply source priority explicitly
      const base=record.score || 0;
      return base + (50-Number(record.sourcePriority || 50));
    }

    return {
      state:RESOURCE_EXECUTION_STATES.DISCOVERED,
      query:String(query || "").slice(0,2000),
      audience,
      role,
      preferenceTerms,
      currentInfoRequested:currentRequested,
      results:ranked.slice(0,Math.max(1,Math.min(20,Number(maxResults)||8))),
      withheldCount:withheld.length,
      withheld,
      sourceStatus:this.sourceStatus(),
      hierarchy:[
        "current-lesson",
        "current-course",
        "current-school",
        "khaemenes-academy",
        "approved-ecosystem",
        "plera-outer-research"
      ],
      hierarchyNote:"Current lesson/course/school sources outrank the central Academy when those sources are connected. v1.2 currently connects the central Academy, ARSHIF, and PLERA Search manifests."
    };
  }
}
