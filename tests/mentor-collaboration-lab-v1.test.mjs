import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMentorDiscoveryIndex} from "../delegation/mentor-discovery-v1.mjs";
import {ConsentedMentorHandoffPilot} from "../delegation/consented-mentor-handoff-v1.mjs";
import {assembleFictionalLearningCapsule,CAPSULE_SCHEMA} from "../mentor-collaboration/learning-capsule-review-v1.mjs";
import {runFictionalDemonstration} from "../mentor-collaboration/run-fictional-lab.mjs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const governance=read("../config/noema-naib-governance-discovery.v1.json");
const catalog=read("../config/creative-spark-approved-knowledge-sources.v1.json");
const index=buildMentorDiscoveryIndex({registry:read("../config/mentor-registry.json"),
 publicRoster:read("../config/creative-spark-roster-alignment.v1.json"),governance});
const fixture=read("../mentor-collaboration/fixtures/public-eiren-example.v1.json");
const principal="fictional-adult-01";
const pilot=(audience="adult")=>new ConsentedMentorHandoffPilot({
 index,governance,authorize:async()=>({granted:true,authenticated:true,audience}),
 verifyConsent:async({evidence})=>evidence===true,verifyGuardian:async({evidence})=>evidence===true
});
async function envelope(audience="adult"){
 const p=pilot(audience);
 const preview=await p.propose({principal,sourceMentorId:"archaemenes",
  targetMentorId:"zelle",objectiveId:"historical-artwork"});
 assert.equal(preview.status,"consent-required");
 const approval=await p.approve({principal,requestId:preview.requestId,
  consentEvidence:true,guardianEvidence:audience==="adult"?undefined:true});
 assert.equal(approval.status,"ready-for-single-use-review");
 const r=await p.release({principal,requestId:preview.requestId});
 assert.equal(r.status,"review-envelope-ready");
 return r.envelope;
}
function packet(){
 const src=catalog.members.find(x=>x.mentorId==="eiren");
 return {
  schema:"creative-spark-approved-knowledge-reference-v1",version:1,purpose:"offline-review-only",
  requestMentorId:"zelle",sourceMentorId:"eiren",sourceName:src.name,
  sourceRepository:src.sourceRepository,sourcePath:src.sourcePath,
  sourceUrl:src.sourceUrl,recordId:fixture.recordId,topic:fixture.topic,answer:fixture.answer,
  matchMethod:"exact-normalized-question",classification:"approved-public-reference",
  claimState:"source-statement",independentlyCorroborated:false,factVerified:false,
  humanReviewCompletedForUse:false,executionAuthority:false,
  liveModelConnected:false,persistentMemory:false,studentDataUsed:false,
  transcriptStored:false,canonPromotion:false
 };
}
const assemble=(env,packets=[])=>assembleFictionalLearningCapsule({
 envelope:env,discoveryIndex:index,governance,catalog,knowledgePackets:packets,reviewEnabled:true
});
test("fictional end-to-end adult + student + revoked demonstrations succeed",async()=>{
 const report=await runFictionalDemonstration();
 assert.equal(report.realConsentVerified,false);assert.equal(report.liveMentorInvoked,false);
 assert.equal(report.networkRequests,0);assert.equal(report.studentRecordsWritten,0);
 assert.equal(report.adult.capsule.schema,CAPSULE_SCHEMA);
 assert.equal(report.adult.capsule.knowledgeReferences.length,1);
 assert.equal(report.adult.capsule.knowledgeReferences[0].recordId,"eiren-public-001");
 assert.equal(report.student.capsule.knowledgeReferences.length,0);
 assert.equal(report.revocation.status,"revoked");
 assert.equal(report.revocation.replayStatus,"withheld");
});
test("adult capsule reuses public Eiren source attribution; not a generated mentor reply",async()=>{
 const result=assemble(await envelope(),[packet()]);
 assert.equal(result.status,"fictional-capsule-preview");
 const c=result.capsule;
 assert.equal(c.targetMentorId,"zelle");
 assert.equal(c.knowledgeReferences[0].sourceRepository,"artist1970/Eiren.github.io");
 assert.equal(c.knowledgeReferences[0].independentlyFactChecked,false);
 assert.equal(c.knowledgeReferences[0].sourceContentRevalidated,false);
 assert.equal(c.delivered,false);assert.equal(c.liveMentorConnected,false);
 assert.match(c.introduction,/Not generated/);
});
test("minor review cannot carry adult-only Q&A material",async()=>{
 const env=await envelope("student");
 assert.equal(assemble(env,[packet()]).reason,"youth-suitability-review-required");
 assert.equal(assemble(env,[]).status,"fictional-capsule-preview");
});
test("forged transcript, authority, target, age or extra fields withhold",async()=>{
 const env=await envelope();
 for(const tamper of [
  {transcriptIncluded:true},{identityIncluded:true},{studentRecordsIncluded:true},
  {networkAccess:true},{executionAuthority:true},{persistentMemory:true},
  {liveModelConnected:true},{dispatched:true},{previousTurnsIncluded:true},
  {consentHostCallbackPassed:false},{sourceMentorId:"naib"},
  {targetMentorId:"noema"},{objectiveLabel:"Transfer the private transcript"},
  {audience:"student"},{prompt:"private history"}
 ])assert.equal(assemble({...env,...tamper}).status,"withheld",JSON.stringify(tamper));
});
test("unknown or duplicated source references are rejected",async()=>{
 const env=await envelope(),p=packet();
 assert.equal(assemble(env,[p,p]).reason,"duplicate-reference");
 assert.equal(assemble(env,[p,p,p,p]).reason,"too-many-references");
 assert.equal(assemble(env,[{...p,factVerified:true}]).status,"withheld");
 assert.equal(assemble(env,[{...p,sourceUrl:"https://invalid.example"}]).status,"withheld");
});
test("governance or review gate failure withholds",async()=>{
 const env=await envelope();
 assert.equal(assembleFictionalLearningCapsule({envelope:env}).status,"withheld");
 assert.equal(assembleFictionalLearningCapsule({
  envelope:env,discoveryIndex:{...index,chancellor:"visitor"},
  governance,catalog,reviewEnabled:true
 }).status,"withheld");
});
test("report contains no fictional principal, secret or guardian evidence",async()=>{
 const report=await runFictionalDemonstration();
 const s=JSON.stringify(report);
 for(const key of ["fictional-adult-01","fictional-student-01","guardianEvidence",
  "consentEvidence","principal","sessionId","fullTranscript"])assert.equal(s.includes(key),false,key);
 assert.equal(report.student.capsule.studentRecordsIncluded,false);
});
test("the capsule assembler does not import networking, persistence or private CORE",()=>{
 const code=readFileSync(new URL("../mentor-collaboration/learning-capsule-review-v1.mjs",import.meta.url),"utf8");
 assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|node:net|child_process/);
});
