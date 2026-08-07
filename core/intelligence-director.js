import {SessionEngine} from "../conversation/session-engine.js";
import {buildProviderContextEnvelope} from "../conversation/context-envelope.js";
import {createNoemaProviderRequest} from "../providers/noema-protocol.js";
import {normalizeProviderResponse} from "../providers/provider-response-normalizer.js";
import {assessResearchRequirement} from "../research/research-trigger.js";
import {buildDelegation} from "../delegation/delegation-engine.js";
import {createProviderTrace} from "../transparency/provider-trace.js";
import {createIntelligenceTrace} from "../transparency/intelligence-trace.js";
import {OrchestrationEngine} from "../orchestration/orchestration-engine.js";
import {buildSpecialistContext} from "../orchestration/specialist-context.js";
import {synthesizeIntegratedResponse} from "../orchestration/response-synthesizer.js";

export class IntelligenceDirector {
  constructor({core,provider}={}) {
    this.core=core;
    this.provider=provider;
    this.session=new SessionEngine();
    this.orchestration=new OrchestrationEngine({core});
  }

  async respond(message, options={}) {
    const route=this.core.route(message,options);
    const researchDecision=assessResearchRequirement(route,route.message);

    let verifierSession=null;
    if (researchDecision.required && route.message) {
      verifierSession=this.core.verifier.createSession(route.message,{
        domain:researchDecision.analysis.domain
      });
    }

    const delegation=buildDelegation(route,{
      researchRequired:researchDecision.required
    });

    const coordinated=this.orchestration.coordinate({
      message:route.message,
      route,
      researchDecision,
      verifierSession
    });

    const specialistContext=buildSpecialistContext(coordinated);

    const researchState=researchDecision.required
      ? {
          required:true,
          domain:researchDecision.analysis.domain,
          status:verifierSession?.verdict?.status || "unexamined",
          verifiedLabelAllowed:verifierSession?.verdict?.canUseVerifiedLabel === true,
          missingRequiredLanes:[...(verifierSession?.verdict?.missingRequiredLanes || [])]
        }
      : {
          required:false,
          domain:"general",
          status:"not-applicable",
          verifiedLabelAllowed:false,
          missingRequiredLanes:[]
        };

    const contextEnvelope=buildProviderContextEnvelope(route.context);

    const request=createNoemaProviderRequest({
      sessionId:this.session.sessionId,
      message:route.message,
      role:route.role,
      mode:route.mode?.id,
      contextEnvelope,
      research:researchState,
      delegation,
      orchestration:{
        taskCount:coordinated.summary.total,
        tasks:specialistContext
      },
      safety:{
        blocked:route.ethics?.blocked,
        needsReview:route.ethics?.needsReview,
        highStakes:route.safety?.highStakes,
        categories:route.safety?.categories
      }
    });

    this.session.add({role:"user",content:route.message});

    let response;
    try {
      response=await this.provider.respond(request);
      response=normalizeProviderResponse(response,this.provider?.id || "unknown");
    } catch (error) {
      response=normalizeProviderResponse({
        text:"The configured conversation provider could not complete this request. NOEMA has preserved the routing and safety state without pretending a model response succeeded.",
        provider:this.provider?.id || "unknown",
        generatedByModel:false,
        finishReason:"provider-error"
      },this.provider?.id || "unknown");
      response.warnings.push(String(error?.message || error).slice(0,800));
    }

    this.session.add({
      role:"assistant",
      content:response.text,
      provider:response.provider,
      generatedByModel:response.generatedByModel
    });

    const integrated=synthesizeIntegratedResponse({
      providerResponse:response,
      orchestration:coordinated,
      research:researchState,
      route
    });

    const providerTrace=createProviderTrace({
      providerStatus:this.provider?.status?.() || {},
      request,
      response,
      research:researchState
    });

    const trace=createIntelligenceTrace({
      route,
      delegation,
      researchDecision,
      verifierSession,
      providerTrace,
      orchestration:coordinated
    });

    return {
      route,
      response:integrated,
      providerResponse:response,
      orchestration:coordinated,
      research:{
        ...researchState,
        session:verifierSession
      },
      delegation,
      trace,
      session:this.session.status()
    };
  }

  resetSession() {
    this.session.reset();
  }

  status() {
    return {
      provider:this.provider?.status?.() || {id:"unknown",connected:false},
      session:this.session.status()
    };
  }
}
