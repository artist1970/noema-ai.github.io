/**
 * NOEMA Chancellor / NAIB Administrator: consent-scoped mentor handoff PILOT.
 * Source-only in-process review; no network, runtime adapters, transcript
 * delivery, account mutation, private CORE or STOS commissioning.
 *
 * Authorization, consent and guardian checks MUST be supplied by a
 * separately trusted host. An arbitrary HTTP field or browser checkbox
 * cannot serve as proof of identity or consent.
 */
import {randomUUID} from "node:crypto";

export const HANDOFF_SCHEMA="vnv-consented-learning-objective-handoff-v1";
const OBJECTIVES=Object.freeze({
 "historical-artwork":Object.freeze({label:"Explore a historical artwork through visual art",target:"zelle"}),
 "historical-poetry":Object.freeze({label:"Explore historical themes through a poem",target:"eiren"}),
 "french-history-vocabulary":Object.freeze({label:"Practice French vocabulary connected with a history lesson",target:"pierre"}),
 "historical-music":Object.freeze({label:"Explore rhythm through an original history-themed composition",target:"moirai"})
});
const READY=Object.freeze({
 eiren:{adapter:"../adapters/eiren-adapter.js",status:"handoff-ready"},
 moirai:{adapter:"../adapters/moirai-adapter.js",status:"existing-reference-implementation"}
});
const AUDIENCES=new Set(["child","student","adult"]);
const MAX_PENDING=20;
const TTL_MS=5*60*1000;
const IDENTIFIER=/^[A-Za-z0-9_-]{8,128}$/;
function fail(reason){return Object.freeze({status:"withheld",reason,delivered:false,authority:"proposal-only"});}
function validIndex(index,governance){
 return index?.status==="aligned"&&index.schema==="noema-naib-mentor-discovery-v1"&&
   index.chancellor==="noema"&&index.administrator==="naib"&&
   Array.isArray(index.entries)&&index.entries.length===13&&
   governance?.schema==="noema-naib-governance-discovery-v1"&&
   governance.chancellor?.id==="noema"&&
   governance.administrator?.id==="naib"&&
   governance.administrator?.reportsTo==="noema"&&
   governance.policy?.independentServerAuthorizationRequired===true;
}
function approvalShape(result,audience){
 return result?.granted===true&&result?.authenticated===true&&
  result?.audience===audience;
}
export class ConsentedMentorHandoffPilot {
 #pending=new Map();
 constructor({authorize,verifyConsent,verifyGuardian,index,governance,clock=Date.now}={}){
  if(typeof authorize!=="function"||typeof verifyConsent!=="function"||
     typeof verifyGuardian!=="function"||typeof clock!=="function")
   throw Error("trusted callbacks required");
  if(!validIndex(index,governance))throw Error("unaligned NOEMA NAIB governance");
  this.authorize=authorize;
  this.verifyConsent=verifyConsent;
  this.verifyGuardian=verifyGuardian;
  this.clock=clock;
  // Freeze the only relevant public route metadata at construction time.
  this.entries=new Map(index.entries.map(e=>[e.id,Object.freeze({
   id:e.id,status:e.status,adapter:e.adapter,url:e.url
  })]));
 }
 #clearExpired(){
  const now=this.clock();
  for(const [id,r] of this.#pending)if(r.expiresAt<=now)this.#pending.delete(id);
 }
 #request(principal,requestId){
  if(typeof principal!=="string"||!IDENTIFIER.test(principal)||
     typeof requestId!=="string"||!IDENTIFIER.test(requestId))return null;
  const r=this.#pending.get(requestId);
  return r?.principal===principal?r:null;
 }
 async propose({principal,sourceMentorId,targetMentorId,objectiveId}={}){
  this.#clearExpired();
  if(typeof principal!=="string"||!IDENTIFIER.test(principal)||
    sourceMentorId!=="archaemenes"||!this.entries.has(sourceMentorId)||
    !Object.prototype.hasOwnProperty.call(OBJECTIVES,objectiveId)||
    OBJECTIVES[objectiveId].target!==targetMentorId||
    !this.entries.has(targetMentorId)||this.#pending.size>=MAX_PENDING)
   return fail("unapproved-or-capacity-limited-route");
  let authorization;
  try{authorization=await this.authorize({
   principal,operation:"mentor.handoff.propose",sourceMentorId,targetMentorId
  });}catch{return fail("host-authorization-denied");}
  if(authorization?.granted!==true||authorization?.authenticated!==true||
     !AUDIENCES.has(authorization?.audience))
   return fail("host-authorization-denied");
  const requestId=randomUUID();
  const now=this.clock();
  this.#pending.set(requestId,{
    principal,sourceMentorId,targetMentorId,objectiveId,
    audience:authorization.audience,expiresAt:now+TTL_MS,state:"proposed"
  });
  return Object.freeze({
    status:"consent-required",requestId,sourceMentorId,targetMentorId,
    objectiveId,objectiveLabel:OBJECTIVES[objectiveId].label,
    audience:authorization.audience,
    guardianVerificationRequired:authorization.audience!=="adult",
    recipientStatus:this.#readiness(targetMentorId),
    transferIncludes:"approved-objective-only",
    transcriptIncluded:false,studentRecordsIncluded:false,
    reviewOnly:true,delivered:false,expiresInSeconds:TTL_MS/1000
  });
 }
 #readiness(id){
  const entry=this.entries.get(id),reference=READY[id];
  return reference&&entry?.adapter===reference.adapter&&entry?.status===reference.status
   ?"verified-handoff-reference-only":"public-discovery-reference-only";
 }
 async approve({principal,requestId,consentEvidence,guardianEvidence}={}){
  this.#clearExpired();
  const request=this.#request(principal,requestId);
  if(!request||request.state!=="proposed")return fail("request-not-pending");
  request.state="verifying";
  const details={principal,requestId,sourceMentorId:request.sourceMentorId,
    targetMentorId:request.targetMentorId,objectiveId:request.objectiveId,
    audience:request.audience};
  try{
   const ok=await this.verifyConsent({...details,evidence:consentEvidence});
   if(ok!==true){this.#pending.delete(requestId);return fail("consent-not-verified");}
   if(request.audience!=="adult"){
    const guardian=await this.verifyGuardian({...details,evidence:guardianEvidence});
    if(guardian!==true){this.#pending.delete(requestId);return fail("guardian-not-verified");}
   }
  }catch{
   this.#pending.delete(requestId);
   return fail("host-consent-verification-error");
  }
  // Revocation may happen while a host verifier is awaiting user/guardian.
  // Its result must not revive a request already deleted by its owner.
  if(this.#pending.get(requestId)!==request)return fail("request-revoked");
  if(request.expiresAt<=this.clock()){
   this.#pending.delete(requestId);return fail("expired-consent");
  }
  request.state="approved";
  return Object.freeze({status:"ready-for-single-use-review",requestId,
   delivered:false,transcriptIncluded:false,reviewOnly:true});
 }
 async release({principal,requestId}={}){
  this.#clearExpired();
  const request=this.#request(principal,requestId);
  if(!request||request.state!=="approved")return fail("not-approved-or-expired");
  // Lock before await to prevent concurrent double-release.
  request.state="releasing";
  let authorization;
  try{authorization=await this.authorize({
   principal,operation:"mentor.handoff.release",
   sourceMentorId:request.sourceMentorId,targetMentorId:request.targetMentorId
  });}catch{
   this.#pending.delete(requestId);return fail("host-authorization-denied");
  }
  if(this.#pending.get(requestId)!==request)return fail("request-revoked");
  if(!approvalShape(authorization,request.audience)||request.expiresAt<=this.clock()){
   this.#pending.delete(requestId);return fail("host-authorization-or-expiry");
  }
  this.#pending.delete(requestId);
  return Object.freeze({
   status:"review-envelope-ready",
   envelope:Object.freeze({
    schema:HANDOFF_SCHEMA,version:1,purpose:"in-process-review-only",
    chancellor:"noema",administrator:"naib",
    sourceMentorId:request.sourceMentorId,
    targetMentorId:request.targetMentorId,
    objectiveId:request.objectiveId,
    objectiveLabel:OBJECTIVES[request.objectiveId].label,
    audience:request.audience,
    consentScope:"one-time-approved-learning-objective",
    consentHostCallbackPassed:true,
    guardianHostCallbackPassed:request.audience==="adult"?false:true,
    recipientStatus:this.#readiness(request.targetMentorId),
    transcriptIncluded:false,studentRecordsIncluded:false,
    previousTurnsIncluded:false,identityIncluded:false,
    executionAuthority:false,liveModelConnected:false,
    persistentMemory:false,networkAccess:false,
    dispatched:false,reviewOnly:true
   }),
   delivered:false,executionAuthority:false
  });
 }
 async revoke({principal,requestId}={}){
  const request=this.#request(principal,requestId);
  if(!request)return fail("request-not-found");
  // An approved but not-yet-released request is revocable; a released
  // copy cannot be recalled from arbitrary external consumers.
  this.#pending.delete(requestId);
  return Object.freeze({status:"revoked",delivered:false,authority:"proposal-only"});
 }
 get pendingCount(){
  this.#clearExpired();
  return this.#pending.size;
 }
}
