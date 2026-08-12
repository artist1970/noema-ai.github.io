import {getNaibIdentity} from "./naib-identity.js";

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isNoemaIdentity(value) {
  if (!value || typeof value !== "object") return false;

  const id = String(value.id || "").toLowerCase();
  const name = String(value.name || "").toLowerCase();

  return id === "noema" || name === "noema";
}

function maskNoemaText(value) {
  return typeof value === "string"
    ? value.replace(/\bNOEMA\b/gi, "NAIB")
    : value;
}

function sanitizePublicResult(result = {}) {
  const safe = clone(result || {});

  // The internal route may carry Noema's live identity and persona because
  // routing is governed behind the scenes. Those objects are not public
  // interface data and must not pass through the NAIB facade.
  if (safe.route?.context) {
    if (isNoemaIdentity(safe.route.context.identity)) {
      delete safe.route.context.identity;
    }

    if (
      safe.route.context.persona &&
      safe.route.context.persona.publicFacing === false
    ) {
      delete safe.route.context.persona;
    }
  }

  // Public delegation should identify NAIB as the coordinating intelligence.
  // This changes only the facade copy; Noema remains the internal regulator.
  if (
    typeof safe.delegation?.primary === "string" &&
    safe.delegation.primary.toLowerCase() === "noema"
  ) {
    safe.delegation.primary = "NAIB";
  }

  if (
    typeof safe.trace?.delegation?.primary === "string" &&
    safe.trace.delegation.primary.toLowerCase() === "noema"
  ) {
    safe.trace.delegation.primary = "NAIB";
  }

  // Internal orchestration may use Noema for understanding/synthesis tasks.
  // Publicly those tasks belong to the NAIB-facing coordinated experience.
  if (Array.isArray(safe.orchestration?.tasks)) {
    safe.orchestration.tasks = safe.orchestration.tasks.map(task => {
      if (!task || typeof task !== "object") return task;

      if (
        typeof task.specialistId === "string" &&
        task.specialistId.toLowerCase() === "noema"
      ) {
        return {
          ...task,
          specialistId: "naib"
        };
      }

      return task;
    });
  }

  // Provider-error fallback text may originate inside Noema's director.
  // The public facade must speak as NAIB without exposing the internal name.
  if (safe.providerResponse && typeof safe.providerResponse === "object") {
    safe.providerResponse.text = maskNoemaText(safe.providerResponse.text);
  }

  if (typeof safe.response === "string") {
    safe.response = maskNoemaText(safe.response);
  } else if (safe.response && typeof safe.response === "object") {
    safe.response.text = maskNoemaText(safe.response.text);

    if (Array.isArray(safe.response.warnings)) {
      safe.response.warnings = safe.response.warnings.map(maskNoemaText);
    }

    if (typeof safe.response.note === "string") {
      safe.response.note = maskNoemaText(safe.response.note);
    }
  }

  return safe;
}

export class NaibFacade {
  constructor({noemaCore}={}) {
    if(!noemaCore) throw new Error("NAIB requires its internal administrative core.");
    this.noema=noemaCore;
    this.identity=getNaibIdentity();
  }

  async respond(message,options={}) {
    const internalResult=await this.noema.respond(message,options);
    const result=sanitizePublicResult(internalResult);

    return {
      ...result,
      publicIdentity:{
        name:this.identity.name,
        title:this.identity.title,
        role:this.identity.role
      },
      administrativeAuthority:{
        name:"Internal Governance",
        publicNameExposed:false,
        constitutionActive:true,
        controls:[
          "permissions",
          "memory governance",
          "identity governance",
          "Verifier standards",
          "specialist authority",
          "security",
          "orchestration"
        ]
      }
    };
  }

  route(message,options={}) {
    const internalRoute=this.noema.route(message,options);
    const sanitized=sanitizePublicResult({route:internalRoute});
    return sanitized.route;
  }

  getCapabilities() {
    return this.noema.getCapabilities();
  }

  checkCapability(id,options={}) {
    return this.noema.checkCapability(id,options);
  }

  rememberExchange(input={}) {
    return this.noema.rememberExchange(input);
  }

  clearLocalData() {
    return this.noema.clearNoemaData();
  }

  getStatus() {
    const status=this.noema.getSystemStatus?.() || {};
    const {identity:internalIdentity,...safeStatus}=status;

    return {
      identity:this.identity,
      administration:{
        ...safeStatus,
        identity:"internal-governance",
        publicNameExposed:false
      }
    };
  }
}
