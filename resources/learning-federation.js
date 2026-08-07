import {FEDERATION_SNAPSHOTS} from "./snapshots/federation-snapshots.js";
import {LEARNING_FEDERATION_SOURCES} from "./federation-source-registry.js";
import {ResourceManifestLoader} from "./resource-manifest-loader.js";
import {explicitPreferenceTerms,checkResourceEligibility,roleFromEnrollment} from "./resource-eligibility.js";
import {resolveLearningContext} from "./learning-context.js";
import {rankFederatedResources} from "./resource-ranker.js";
import {educationalGameStatus,queryRequestsGame} from "./educational-game-policy.js";
import {groupResources} from "./resource-groups.js";
import {CourseResourceGraph} from "./course-resource-graph.js";
import {healthLearningPolicy,financeFreshnessPolicy} from "./domain-learning-policy.js";
import {RESOURCE_EXECUTION_STATES} from "./execution-state.js";

function currentInfoRequested(query="",mode="personal") {
  return mode==="research" ||
    /\b(current|latest|today|now|news|recent|updated|fresh|jobs?|market)\b/i.test(String(query || ""));
}

function relevantRefreshSourceIds({query="",mode="personal",learningContext={}}={}) {
  const ids=new Set([
    learningContext.currentSchoolSourceId,
    "khaemenes.academy"
  ].filter(Boolean));

  if(/\b(language|arabic|esl|english|linguistic|vocabulary|word|spelling)\b/i.test(query))
    ids.add("khaemenes.linguistics");

  if(mode==="archive" || mode==="research" ||
     /\b(archive|history|reading|source|manuscript|reference)\b/i.test(query))
    ids.add("verve.arshif");

  if(mode==="research" ||
     /\b(current|latest|today|news|search|research)\b/i.test(query))
    ids.add("verve.plera-search");

  return [...ids];
}

export class LearningFederation {
  constructor({fetchImpl}={}) {
    this.loaders=new Map(
      LEARNING_FEDERATION_SOURCES.map(source=>[
        source.id,
        new ResourceManifestLoader({
          source,
          snapshot:FEDERATION_SNAPSHOTS[source.id],
          fetchImpl
        })
      ])
    );
    this.graph=new CourseResourceGraph();
    this.lastRefresh=null;
    this.rebuildGraph();
  }

  rebuildGraph(){
    const records=LEARNING_FEDERATION_SOURCES.map(source=>({
      source,
      manifest:this.loaders.get(source.id).get().manifest
    }));
    return this.graph.rebuild(records);
  }

  async refresh({allowNetwork=true,timeoutMs=3500,sourceIds=null}={}) {
    const filter=Array.isArray(sourceIds) && sourceIds.length ? new Set(sourceIds) : null;
    const jobs=[];

    for(const [id,loader] of this.loaders) {
      if(filter && !filter.has(id)) continue;
      jobs.push(loader.refresh({allowNetwork,timeoutMs}));
    }

    const results=await Promise.all(jobs);
    this.lastRefresh=new Date().toISOString();
    this.rebuildGraph();
    return results.map(item=>item.provenance);
  }

  async refreshForRequest({query="",mode="personal",context={},timeoutMs=3500}={}) {
    const learningContext=resolveLearningContext({query,context});
    return this.refresh({
      allowNetwork:true,
      timeoutMs,
      sourceIds:relevantRefreshSourceIds({query,mode,learningContext})
    });
  }

  sourceStatus(){
    return [...this.loaders.entries()].map(([id,loader])=>{
      const current=loader.get();
      return {
        id,
        resourceCount:current.manifest.resources.length,
        sourceKind:current.provenance.sourceKind,
        provenance:current.provenance
      };
    });
  }

  discover({query="",mode="personal",context={},sourceIds=null,maxResults=14}={}) {
    const learningContext=resolveLearningContext({query,context});
    const audience=learningContext.effectiveAudience;
    const role=roleFromEnrollment(context.enrollment);
    const preferenceTerms=explicitPreferenceTerms({query,context});
    const sourceFilter=Array.isArray(sourceIds) && sourceIds.length ? new Set(sourceIds) : null;
    const currentRequested=currentInfoRequested(query,mode);
    const wantsGame=queryRequestsGame(query);

    const eligible=[];
    const withheld=[];
    const sourceRecords=[];

    for(const source of LEARNING_FEDERATION_SOURCES) {
      if(sourceFilter && !sourceFilter.has(source.id)) continue;
      const loader=this.loaders.get(source.id);
      const {manifest,provenance}=loader.get();
      sourceRecords.push({source,manifest});

      for(const resource of manifest.resources || []) {
        const eligibility=checkResourceEligibility(resource,{
          audience,role,preferenceTerms
        });

        const game=educationalGameStatus(resource);
        const health=healthLearningPolicy(resource,query);
        const finance=financeFreshnessPolicy(resource);

        const record={
          ...resource,
          sourceTier:source.tier,
          sourcePriority:source.priority,
          sourceKind:source.sourceKind,
          sourceStage:source.stage,
          manifestProvenance:provenance.mode,
          manifestRefreshedAt:provenance.refreshedAt,
          executionState:RESOURCE_EXECUTION_STATES.DISCOVERED,
          verified:false,
          freshnessStatus:resource.requiresFreshnessCheck ? "required" : "not-required",
          educationalGame:game,
          verifierRequired:health.verifierRequired,
          highStakesReason:health.highStakes ? health.reason : "",
          financeFreshnessRequired:finance.freshnessRequired
        };

        // Unknown-value games do not enter ordinary educational ranking.
        // They can only enter when the user explicitly asks for a game and
        // the query actually matches that game/topic.
        if(eligibility.eligible) {
          if(game.game && !game.eligibleForEducationalRanking && !wantsGame) {
            withheld.push({
              id:resource.id,sourceId:resource.sourceId,
              reasons:["educational-game-objective-not-established"]
            });
          } else {
            eligible.push(record);
          }
        } else {
          withheld.push({
            id:resource.id,
            sourceId:resource.sourceId,
            reasons:eligibility.reasons
          });
        }
      }
    }

    const ranked=rankFederatedResources(eligible,{
      query,
      mode,
      currentSchoolSourceId:learningContext.currentSchoolSourceId,
      favoriteSubject:learningContext.favoriteSubject,
      currentInfoRequested:currentRequested
    });

    // When an unknown-value game was admitted because a game was requested,
    // require some lexical match before returning it.
    const filtered=ranked.filter(r=>{
      if(r.resourceType==="game" && !r.educationalGame.eligibleForEducationalRanking)
        return r.matches>0;
      return true;
    });

    const limit=Math.max(1,Math.min(30,Number(maxResults)||14));
    const results=filtered.slice(0,limit);
    const coverage=this.graph.coverageForQuery(query,results);
    const groups=groupResources(results,learningContext.currentSchoolSourceId);

    return {
      state:RESOURCE_EXECUTION_STATES.DISCOVERED,
      query:String(query || "").slice(0,2000),
      audience,
      role,
      learningContext,
      preferenceTerms,
      currentInfoRequested:currentRequested,
      results,
      groups,
      coverage,
      graphStatus:this.graph.status(),
      withheldCount:withheld.length,
      withheld,
      sourceStatus:this.sourceStatus(),
      hierarchy:[
        "explicit-current-lesson",
        "explicit-current-course",
        "current-khaemenes-school",
        "khaemenes-academy",
        "approved-learning-extensions",
        "educational-games",
        "arshif-archive-extension",
        "plera-outer-research"
      ],
      hierarchyNote:
        "Current-school resources outrank central Academy and extension resources. " +
        "Games do not outrank direct coursework unless the user explicitly asks for a game/practice activity. " +
        "Missing unit/lesson nodes are reported as coverage gaps rather than invented."
    };
  }
}
