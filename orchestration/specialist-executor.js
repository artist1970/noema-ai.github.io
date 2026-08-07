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
        theme:route.mode?.id || "creative",
        mood:context.avatar?.temperament || "",
        palette:""
      });
      return {
        status:"handoff",
        output:{
          type:"specialist-handoff",
          specialistId,
          url:handoff.url,
          brief:handoff.brief,
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

    if(["prose","arshif","plera-search"].includes(specialistId)) {
      return {
        status:"handoff",
        output:{
          type:"specialist-handoff",
          specialistId,
          url:s.url || "",
          brief:{
            message:String(message || "").slice(0,6000),
            mode:route.mode?.id || "personal",
            project:context.project
              ? {title:context.project.title || "",summary:context.project.summary || ""}
              : null
          },
          executed:false
        }
      };
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
