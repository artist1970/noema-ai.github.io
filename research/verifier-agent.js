import {analyzeClaim} from "./claim-analyzer.js";
import {buildVerificationPlan} from "./verification-plan.js";
import {VerificationTaskHandler} from "./verification-task-handler.js";
import {normalizeSource} from "./source-policy.js";
import {evaluateEvidence} from "./evidence-matrix.js";
import {statusLabel} from "./fact-status.js";
import {VerifierSessionStore} from "./verifier-session-store.js";

export class VerifierAgent {
  constructor({storage}={}) {
    this.sessions=new VerifierSessionStore(storage);
  }

  createSession(claim,{domain="auto"}={}) {
    const analysis=analyzeClaim(claim,{domain});
    const plan=buildVerificationPlan(analysis);
    const handler=new VerificationTaskHandler(plan.tasks);
    handler.refresh();

    return {
      id:null,
      schemaVersion:1,
      agent:"the-verifier",
      supervisor:"noema",
      claim:analysis.claim,
      analysis,
      plan:{
        domain:plan.domain,
        requirements:plan.requirements,
        lanes:plan.lanes
      },
      tasks:handler.list(),
      taskLedger:[],
      sources:[],
      completedLaneIds:[],
      freshnessSatisfied:!analysis.requiresFreshness,
      verdict:evaluateEvidence({
        claimAnalysis:analysis,
        sources:[],
        completedLaneIds:[],
        freshnessSatisfied:!analysis.requiresFreshness
      }),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
  }

  addSource(session,source={}) {
    const normalized=normalizeSource(source);
    const sources=[...(session.sources||[]),normalized];
    return this.recalculate({...session,sources});
  }

  completeLane(session,laneId) {
    const completed=[...new Set([...(session.completedLaneIds||[]),String(laneId)])];
    return this.recalculate({...session,completedLaneIds:completed});
  }

  setFreshness(session,value) {
    return this.recalculate({...session,freshnessSatisfied:value===true});
  }

  recalculate(session) {
    const verdict=evaluateEvidence({
      claimAnalysis:session.analysis,
      sources:session.sources||[],
      completedLaneIds:session.completedLaneIds||[],
      freshnessSatisfied:session.freshnessSatisfied===true
    });
    return {...session,verdict,updatedAt:new Date().toISOString()};
  }

  summarize(session) {
    const v=session.verdict;
    return {
      label:statusLabel(v.status),
      status:v.status,
      canUseVerifiedLabel:v.canUseVerifiedLabel,
      sourceCount:v.sourceCount,
      independentFamilies:v.independence.independentFamilyCount,
      primaryCount:v.primaryCount,
      missingRequiredLanes:v.missingRequiredLanes,
      warnings:v.independence.warnings
    };
  }

  save(session) {
    return this.sessions.save(session,{confirmed:true});
  }

  clear(){this.sessions.clear()}
}
