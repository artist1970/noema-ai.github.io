import {specialistEligible,getSpecialist} from "../specialists/specialist-registry.js";
import {buildMentorAdaptation} from "./mentor-adaptation.js";
import {createMoiraiHandoff} from "../adapters/moirai-adapter.js";
import {createHopeHandoff} from "../adapters/hope-adapter.js";

function audienceFromContext(context={}) {
  const band=context.enrollment?.ageBand;
  return band==="child-under-13" ? "child" :
    band==="teen-13-17" ? "student" : "adult";
}

function explicitHopeRequest(message="") {
  return /\bhope\b/i.test(String(message || ""));
}

function createRegistryHandoff(specialistId,s,{
  message="",
  route={},
  context={}
}={}) {
  return {
    status:"handoff",
    output:{
      type:"specialist-handoff",
      specialistId,
      label:s?.label || specialistId,
      authority:s?.authority || "",
      url:s?.url || "",
      brief:{
        message:String(message || "").slice(0,6000),
        mode:route.mode?.id || "personal",
        project:context.project
          ? {
              title:context.project.title || "",
              summary:context.project.summary || ""
            }
          : null
      },
      executed:false
    }
  };
}

export class SpecialistExecutor {
  constructor({core}={}) {
    this.core=core;
  }

  execute(task,{
    message="",
    route={},
    context={},
    verifierSession=null
  }={}) {
    const specialistId=task.specialistId || "noema";

    if(specialistId==="noema") {
      return {
        status:"complete",
        output:{
          type:"noema-local",
          note:task.id==="understand"
            ? "NOEMA established the goal, mode, role and available context."
            : "NOEMA will synthesize the settled specialist states."
        }
      };
    }

    const eligibility=specialistEligible(specialistId,{
      audience:audienceFromContext(context),
      explicitRequest:explicitHopeRequest(message),
      accountConnected:this.core?.accountServer?.connected === true
    });

    if(!eligibility.eligible) {
      return {
        status:eligibility.reason==="account-required" ? "unavailable" : "blocked",
        output:{
          specialistId,
          reason:eligibility.reason
        }
      };
    }

    const s=getSpecialist(specialistId);

    if(specialistId==="resource-director") {
      if(!this.core?.resourceDirector) {
        return {
          status:"unavailable",
          output:{
            type:"resource-discovery",
            specialistId,
            executionState:"UNAVAILABLE",
            reason:"Resource Director is not available."
          }
        };
      }

      const discovery=this.core.resourceDirector.discover({
        query:message,
        mode:route.mode?.id || "personal",
        context,
        maxResults:8
      });

      return {
        status:"complete",
        output:{
          type:"resource-discovery",
          specialistId,
          executionState:"EXECUTED",
          discoveryState:"DISCOVERED",
          ...discovery
        }
      };
    }

    if(specialistId==="verifier") {
      return {
        status:"complete",
        output:{
          type:"verifier-state",
          specialistId,
          domain:verifierSession?.analysis?.domain || "general",
          evidenceStatus:verifierSession?.verdict?.status || "unexamined",
          verifiedLabelAllowed:verifierSession?.verdict?.canUseVerifiedLabel === true,
          missingRequiredLanes:[...(verifierSession?.verdict?.missingRequiredLanes || [])]
        }
      };
    }

    if(specialistId==="mentor") {
      return {
        status:"complete",
        output:{
          type:"mentor-adaptation",
          specialistId,
          adaptation:buildMentorAdaptation({
            enrollment:context.enrollment,
            avatar:context.avatar
          })
        }
      };
    }

    if(specialistId==="sovereign") {
      return {
        status:"complete",
        output:{
          type:"decision-frame",
          specialistId,
          criteria:[
            "clarify the objective",
            "identify constraints",
            "separate reversible from irreversible choices",
            "compare tradeoffs",
            "choose the smallest safe next step"
          ],
          consequentialActionAuthorized:false
        }
      };
    }

    if(specialistId==="moirai") {
      const handoff=createMoiraiHandoff({
        prompt:message,
        mode:route.mode?.id || "",
        mood:context.avatar?.temperament || ""
      });

      return {
        status:"handoff",
        output:{
          type:"specialist-handoff",
          specialistId,
          label:s?.label || "Moirai",
          authority:s?.authority || "",
          url:handoff.url,
          brief:handoff.brief,
          boundaries:[...(handoff.boundaries || [])],
          note:handoff.note || "",
          executed:false
        }
      };
    }

    if(specialistId==="hope") {
      const handoff=createHopeHandoff({prompt:message});
      return {
        status:"handoff",
        output:{
          type:"specialist-handoff",
          specialistId,
          url:handoff.url,
          prompt:handoff.prompt,
          executed:false,
          inheritedMemory:false
        }
      };
    }

    if([
      "prose",
      "eiren",
      "zelle",
      "archaemenes",
      "arshif",
      "plera-search"
    ].includes(specialistId)) {
      return createRegistryHandoff(specialistId,s,{
        message,
        route,
        context
      });
    }

    return {
      status:"unavailable",
      output:{
        specialistId,
        reason:"No approved executor is connected for this specialist."
      }
    };
  }
}
