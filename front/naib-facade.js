import {getNaibIdentity} from "./naib-identity.js";

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isInternalIdentity(value) {
  if (!value || typeof value !== "object") return false;

  const id = String(value.id || "").toLowerCase();
  const name = String(value.name || "").toLowerCase();

  return id === "noema" || name === "noema";
}

function maskInternalName(value) {
  return typeof value === "string"
    ? value.replace(/\bNOEMA\b/gi, "NAIB")
    : value;
}

function sanitizePublicResult(result = {}) {
  const safe = clone(result || {});

  // Internal live identity/persona objects are implementation data.
  // They do not cross the NAIB public facade.
  if (safe.route?.context) {
    if (isInternalIdentity(safe.route.context.identity)) {
      delete safe.route.context.identity;
    }

    if (
      safe.route.context.persona &&
      safe.route.context.persona.publicFacing === false
    ) {
      delete safe.route.context.persona;
    }
  }

  // Public delegation identifies NAIB as the coordinating intelligence.
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

  if (Array.isArray(safe.orchestration?.tasks)) {
    safe.orchestration.tasks = safe.orchestration.tasks.map(task => {
      if (!task || typeof task !== "object") return task;

      if (
        typeof task.specialistId === "string" &&
        task.specialistId.toLowerCase() === "noema"
      ) {
        return {
          ...task,
          specialistId:"naib"
        };
      }

      return task;
    });
  }

  if (safe.providerResponse && typeof safe.providerResponse === "object") {
    safe.providerResponse.text = maskInternalName(safe.providerResponse.text);
  }

  if (typeof safe.response === "string") {
    safe.response = maskInternalName(safe.response);
  } else if (safe.response && typeof safe.response === "object") {
    safe.response.text = maskInternalName(safe.response.text);

    if (Array.isArray(safe.response.warnings)) {
      safe.response.warnings = safe.response.warnings.map(maskInternalName);
    }

    if (typeof safe.response.note === "string") {
      safe.response.note = maskInternalName(safe.response.note);
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
        role:this.identity.role,
        canonicalFront:this.identity.publicFront.url
      },

      publicContract:{
        canonicalFront:this.identity.publicFront.url,
        canonicalCoreRef:this.identity.core.canonicalRef,
        privateCoreFetchedByBrowser:false,
        humanFinalAuthority:true
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
      publicFront:this.identity.publicFront,
      administration:{
        ...safeStatus,
        identity:"internal-governance",
        publicNameExposed:false
      }
    };
  }
}
