import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMentorDiscoveryIndex} from "../delegation/mentor-discovery-v1.mjs";
import {ConsentedMentorHandoffPilot,HANDOFF_SCHEMA} from "../delegation/consented-mentor-handoff-v1.mjs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const index=buildMentorDiscoveryIndex({
 registry:read("../config/mentor-registry.json"),
 publicRoster:read("../config/creative-spark-roster-alignment.v1.json"),
 governance:read("../config/noema-naib-governance-discovery.v1.json")
});
const governance=read("../config/noema-naib-governance-discovery.v1.json");
let time=100000;
const allow=async({principal})=>({
 granted:principal==="learner-1234",authenticated:true,audience:"student"
});
const getPilot=(overrides={})=>new ConsentedMentorHandoffPilot({
 index,governance,clock:()=>time,
 authorize:allow,
 verifyConsent:async({evidence})=>evidence?.type==="explicit-owner-confirmation",
 verifyGuardian:async({evidence})=>evidence?.type==="verified-guardian-approval",
 ...overrides
});
const props=(targetMentorId="zelle",objectiveId="historical-artwork")=>({
 principal:"learner-1234",sourceMentorId:"archaemenes",targetMentorId,objectiveId
});
test("proposed Archaemenes to Zelle handoff is a consent preview only",async()=>{
 const pilot=getPilot();
 const p=await pilot.propose(props());
 assert.equal(p.status,"consent-required");
 assert.equal(p.recipientStatus,"public-discovery-reference-only");
 assert.equal(p.guardianVerificationRequired,true);
 assert.equal(p.delivered,false);
 assert.equal(p.transcriptIncluded,false);
 assert.equal(p.studentRecordsIncluded,false);
 assert.equal(pilot.pendingCount,1);
 assert.equal(p.envelope,undefined);
});
test("explicit student plus guardian approval yields one review-only envelope",async()=>{
 const pilot=getPilot();
 const p=await pilot.propose(props());
 assert.equal((await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},
  guardianEvidence:{type:"verified-guardian-approval"}})).status,"ready-for-single-use-review");
 const r=await pilot.release({principal:"learner-1234",requestId:p.requestId});
 assert.equal(r.status,"review-envelope-ready");
 const e=r.envelope;
 assert.equal(e.schema,HANDOFF_SCHEMA);
 assert.equal(e.objectiveLabel,"Explore a historical artwork through visual art");
 assert.equal(e.chancellor,"noema");assert.equal(e.administrator,"naib");
 assert.equal(e.guardianHostCallbackPassed,true);
 for(const k of ["transcriptIncluded","studentRecordsIncluded","previousTurnsIncluded",
  "identityIncluded","executionAuthority","liveModelConnected","persistentMemory",
  "networkAccess","dispatched"])assert.equal(e[k],false,k);
 assert.equal(Object.isFrozen(e),true);
 assert.equal(Object.hasOwn(e,"principal"),false);
 assert.equal(Object.hasOwn(e,"message"),false);
 assert.equal(Object.hasOwn(e,"sessionId"),false);
 assert.equal(pilot.pendingCount,0);
 assert.equal((await pilot.release({principal:"learner-1234",requestId:p.requestId})).status,"withheld");
});
test("Eiren is a verified handoff reference but still not a live connected AI",async()=>{
 const pilot=getPilot();
 const p=await pilot.propose(props("eiren","historical-poetry"));
 assert.equal(p.recipientStatus,"verified-handoff-reference-only");
 await pilot.approve({principal:"learner-1234",requestId:p.requestId,
 consentEvidence:{type:"explicit-owner-confirmation"},
 guardianEvidence:{type:"verified-guardian-approval"}});
 const r=await pilot.release({principal:"learner-1234",requestId:p.requestId});
 assert.equal(r.envelope.recipientStatus,"verified-handoff-reference-only");
 assert.equal(r.envelope.liveModelConnected,false);
 assert.equal(r.envelope.dispatched,false);
});
test("Pierre can be discovered for French vocabulary but cannot receive an automatic transcript",async()=>{
 const p=await getPilot().propose(props("pierre","french-history-vocabulary"));
 assert.equal(p.status,"consent-required");
 assert.equal(p.recipientStatus,"public-discovery-reference-only");
 assert.equal(JSON.stringify(p).includes("conversationHistory"),false);
});
test("Moirai is eligible only for its curated music objective",async()=>{
 const pilot=getPilot();
 assert.equal((await pilot.propose(props("moirai","historical-music"))).status,"consent-required");
 assert.equal((await pilot.propose(props("moirai","historical-artwork"))).status,"withheld");
});
test("no silent consent, no spoofing guardian and no reused request",async()=>{
 const pilot=getPilot();
 const p=await pilot.propose(props());
 assert.equal((await pilot.release({principal:"learner-1234",requestId:p.requestId})).status,"withheld");
 assert.equal((await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},guardianEvidence:false})).reason,
  "guardian-not-verified");
 assert.equal((await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},
  guardianEvidence:{type:"verified-guardian-approval"}})).status,"withheld");
});
test("wrong principal is neither informed of the objective nor allowed to approve or revoke",async()=>{
 const pilot=getPilot(),p=await pilot.propose(props());
 for(const operation of ["approve","release","revoke"]){
  const r=await pilot[operation]({principal:"other-user-1234",requestId:p.requestId});
  assert.equal(r.status,"withheld");
  assert.equal(Object.hasOwn(r,"objectiveLabel"),false);
 }
 assert.equal(pilot.pendingCount,1);
});
test("revocation erases a pending/approved handoff before release",async()=>{
 const pilot=getPilot(),p=await pilot.propose(props());
 await pilot.approve({principal:"learner-1234",requestId:p.requestId,
 consentEvidence:{type:"explicit-owner-confirmation"},
 guardianEvidence:{type:"verified-guardian-approval"}});
 assert.equal((await pilot.revoke({principal:"learner-1234",requestId:p.requestId})).status,"revoked");
 assert.equal((await pilot.release({principal:"learner-1234",requestId:p.requestId})).status,"withheld");
});
test("minor cannot bypass guardian callback; adult can explicitly consent without guardian",async()=>{
 const pilot=getPilot({
 authorize:async()=>({granted:true,authenticated:true,audience:"adult"}),
 verifyGuardian:async()=>{throw Error("adult must not call guardian");}
 });
 const p=await pilot.propose(props());
 assert.equal(p.guardianVerificationRequired,false);
 const a=await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"}});
 assert.equal(a.status,"ready-for-single-use-review");
 const r=await pilot.release({principal:"learner-1234",requestId:p.requestId});
 assert.equal(r.envelope.guardianHostCallbackPassed,false);
});
test("changing permission on release revokes even a previously approved request",async()=>{
 let enabled=true;
 const pilot=getPilot({authorize:async()=>({granted:enabled,authenticated:true,audience:"student"})});
 const p=await pilot.propose(props());
 await pilot.approve({principal:"learner-1234",requestId:p.requestId,
 consentEvidence:{type:"explicit-owner-confirmation"},guardianEvidence:{type:"verified-guardian-approval"}});
 enabled=false;
 assert.equal((await pilot.release({principal:"learner-1234",requestId:p.requestId})).status,"withheld");
 assert.equal(pilot.pendingCount,0);
});
test("expired consents have no durable memory or release path",async()=>{
 time=100000;
 const pilot=getPilot(),p=await pilot.propose(props());
 time+=301000;
 assert.equal((await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},guardianEvidence:{type:"verified-guardian-approval"}})).status,"withheld");
 assert.equal(pilot.pendingCount,0);
 time=100000;
});
test("unregistered, privileged, high-stakes or arbitrary free-text routes are blocked",async()=>{
 const pilot=getPilot();
 for(const target of ["noema","naib","klasaipeer","hope","aurora","../../private"]){
  assert.equal((await pilot.propose(props(target,"historical-artwork"))).status,"withheld");
 }
 const extra={...props(),objectiveId:"Here is my whole conversation and student record"};
 assert.equal((await pilot.propose(extra)).status,"withheld");
 assert.equal((await pilot.propose({...props(),sourceMentorId:"noema"})).status,"withheld");
});
test("revocation while consent verification is pending cannot revive the request",async()=>{
 let completeConsent;
 const pilot=getPilot({verifyConsent:()=>new Promise(resolve=>{completeConsent=resolve;})});
 const p=await pilot.propose(props());
 const waiting=pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},
  guardianEvidence:{type:"verified-guardian-approval"}});
 assert.equal(typeof completeConsent,"function");
 assert.equal((await pilot.revoke({principal:"learner-1234",requestId:p.requestId})).status,"revoked");
 completeConsent(true);
 assert.equal((await waiting).status,"withheld");
 assert.equal(pilot.pendingCount,0);
 assert.equal((await pilot.release({principal:"learner-1234",requestId:p.requestId})).status,"withheld");
});
test("revocation during release authorization cancels dispatch even after a successful host check",async()=>{
 let completeRelease;
 const pilot=getPilot({authorize:({operation})=>operation==="mentor.handoff.release"
  ?new Promise(resolve=>{completeRelease=resolve;})
  :{granted:true,authenticated:true,audience:"student"}});
 const p=await pilot.propose(props());
 await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},
  guardianEvidence:{type:"verified-guardian-approval"}});
 const waiting=pilot.release({principal:"learner-1234",requestId:p.requestId});
 assert.equal(typeof completeRelease,"function");
 assert.equal((await pilot.revoke({principal:"learner-1234",requestId:p.requestId})).status,"revoked");
 completeRelease({granted:true,authenticated:true,audience:"student"});
 assert.equal((await waiting).status,"withheld");
 assert.equal(pilot.pendingCount,0);
});
test("concurrent release attempts cannot each produce an objective envelope",async()=>{
 let completeRelease;
 const pilot=getPilot({authorize:({operation})=>operation==="mentor.handoff.release"
  ?new Promise(resolve=>{completeRelease=resolve;})
  :{granted:true,authenticated:true,audience:"student"}});
 const p=await pilot.propose(props());
 await pilot.approve({principal:"learner-1234",requestId:p.requestId,
  consentEvidence:{type:"explicit-owner-confirmation"},
  guardianEvidence:{type:"verified-guardian-approval"}});
 const first=pilot.release({principal:"learner-1234",requestId:p.requestId});
 const second=await pilot.release({principal:"learner-1234",requestId:p.requestId});
 assert.equal(second.status,"withheld");
 completeRelease({granted:true,authenticated:true,audience:"student"});
 assert.equal((await first).status,"review-envelope-ready");
 assert.equal(pilot.pendingCount,0);
});
test("separate trusted callbacks are mandatory and source cannot import storage or network",()=>{
 assert.throws(()=>new ConsentedMentorHandoffPilot({index,governance}),/trusted callbacks/);
 const code=readFileSync(new URL("../delegation/consented-mentor-handoff-v1.mjs",import.meta.url),"utf8");
 assert.doesNotMatch(code,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|node:net|child_process/);
});
