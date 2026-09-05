import fs from "node:fs";
import crypto from "node:crypto";

const CONTRACT_URL = new URL("./contract.json", import.meta.url);
const FORBIDDEN_KEYS = new Set([
  "password","passcode","secret","token","privatekey","apikey",
  "authorization","cookie","sessioncookie","admintoken","rootkey",
  "recoverycode","controlplanesecret"
]);

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function sha256(value){
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function measureDepth(value, depth=0){
  if(value === null || typeof value !== "object") return depth;
  const values = Array.isArray(value) ? value : Object.values(value);
  if(!values.length) return depth;
  return Math.max(...values.map(item => measureDepth(item, depth + 1)));
}

function scan(value, maxStringLength, path="$"){
  if(typeof value === "string" && value.length > maxStringLength){
    throw new Error(`adit-naib-string-too-long:${path}`);
  }
  if(Array.isArray(value)){
    value.forEach((item,index)=>scan(item,maxStringLength,`${path}[${index}]`));
    return;
  }
  if(value && typeof value === "object"){
    for(const [key,item] of Object.entries(value)){
      const normalized=key.toLowerCase().replace(/[^a-z0-9]/g,"");
      if(FORBIDDEN_KEYS.has(normalized)){
        throw new Error(`adit-naib-forbidden-secret-key:${key}`);
      }
      scan(item,maxStringLength,`${path}.${key}`);
    }
  }
}

export function loadNaibAditContract(){
  const contract=JSON.parse(fs.readFileSync(CONTRACT_URL,"utf8"));
  if(contract.schema !== "naib-adit-stos-contract" || contract.version !== 1){
    throw new Error("invalid-naib-adit-contract");
  }
  if(contract.authority !== "proposal-only") throw new Error("unsafe-naib-adit-authority");
  if(contract.routing?.direct9844Proxy !== false) throw new Error("unsafe-naib-direct-9844");
  if(contract.preservation?.liveCloudDirectWriteFromAdit !== false) throw new Error("unsafe-naib-cloud-write");
  return contract;
}

export function validateAditNaibRequest(request={}, contract=loadNaibAditContract()) {
  const encoded=JSON.stringify(request);
  if(Buffer.byteLength(encoded,"utf8") > contract.limits.maxRequestBytes){
    return {allowed:false,code:"REQUEST_TOO_LARGE",reason:"Request exceeds NAIB ADIT boundary size limit."};
  }

  try {
    if(measureDepth(request) > contract.limits.maxDepth) throw new Error("adit-naib-depth-exceeded");
    scan(request, contract.limits.maxStringLength);
  } catch(error) {
    return {allowed:false,code:"INVALID_ARGUMENTS",reason:error.message};
  }

  const intent=String(request.intent || "").trim();
  if(!intent) return {allowed:false,code:"INTENT_REQUIRED",reason:"A bounded intent is required."};

  if(contract.deniedIntents.some(item => intent === item || intent.startsWith(`${item}.`))){
    return {allowed:false,code:"INTENT_DENIED",reason:`Intent ${intent} is denied at the NAIB ADIT boundary.`};
  }
  if(!contract.acceptedIntents.includes(intent)){
    return {allowed:false,code:"INTENT_NOT_ALLOWLISTED",reason:`Intent ${intent} is not allowlisted.`};
  }

  return {allowed:true,code:"ALLOW_PROPOSAL",reason:"Intent may be represented as a proposal only."};
}

export function createAditNaibProposal(request={}, contract=loadNaibAditContract()) {
  const decision=validateAditNaibRequest(request,contract);
  if(!decision.allowed) return {ok:false,decision};

  const body={
    schema:"naib-adit-proposal",
    version:1,
    authority:"proposal-only",
    requestId:String(request.requestId || "").slice(0,256),
    intent:String(request.intent),
    goal:String(request.goal || "").slice(0,4000),
    specialistHints:[...new Set((request.specialistHints || []).map(String))].slice(0,16),
    requestedCapabilities:[...new Set((request.capabilities || []).map(String))].slice(0,32),
    evidence:[...new Set((request.evidence || []).map(String))].slice(0,64),
    publicIdentity:contract.identity.public,
    runtime:contract.identity.protectedRuntime,
    specialistRouter:contract.routing.specialistRouter,
    finalAuthority:contract.routing.finalAuthority,
    executionRequested:false,
    mutationRequested:false,
    adminRequested:false,
    secretAccessRequested:false,
    cloudWriteRequested:false,
    dispatchPerformed:false
  };

  return {
    ok:true,
    decision,
    proposal:{...clone(body),proposalSha256:sha256(JSON.stringify(body))}
  };
}
