#!/usr/bin/env node
/** This runner deliberately uses FICTIONAL authorizers, not genuine consent. */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildMentorDiscoveryIndex} from "../delegation/mentor-discovery-v1.mjs";
import {ConsentedMentorHandoffPilot} from "../delegation/consented-mentor-handoff-v1.mjs";
import {assembleFictionalLearningCapsule} from "./learning-capsule-review-v1.mjs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const governance=read("../config/noema-naib-governance-discovery.v1.json");
const catalog=read("../config/creative-spark-approved-knowledge-sources.v1.json");
const index=buildMentorDiscoveryIndex({
 registry:read("../config/mentor-registry.json"),
 publicRoster:read("../config/creative-spark-roster-alignment.v1.json"),governance
});
const fixture=read("./fixtures/public-eiren-example.v1.json");
const labEvidence=Object.freeze({kind:"FICTIONAL_LAB_ONLY",approved:true});
function pilotFor(audience){
 const principal=audience==="adult"?"fictional-adult-01":"fictional-student-01";
 const pilot=new ConsentedMentorHandoffPilot({
  index,governance,
  authorize:async x=>({granted:x.principal===principal,
   authenticated:x.principal===principal,audience}),
  verifyConsent:async x=>x.evidence?.kind==="FICTIONAL_LAB_ONLY"&&x.evidence?.approved===true,
  verifyGuardian:async x=>x.evidence?.kind==="FICTIONAL_LAB_ONLY"&&x.evidence?.approved===true
 });
 return {principal,pilot};
}
function eirenPacket(requestMentorId){
 const m=catalog.members.find(x=>x.mentorId==="eiren");
 if(!m||fixture.fixtureOnly!==true)throw Error("fixture not approved for lab");
 return {
  schema:"creative-spark-approved-knowledge-reference-v1",version:1,purpose:"offline-review-only",
  requestMentorId,sourceMentorId:"eiren",sourceName:m.name,
  sourceRepository:m.sourceRepository,sourcePath:m.sourcePath,
  sourceUrl:m.sourceUrl,recordId:fixture.recordId,topic:fixture.topic,
  answer:fixture.answer,matchMethod:"exact-normalized-question",
  classification:"approved-public-reference",claimState:"source-statement",
  independentlyCorroborated:false,factVerified:false,humanReviewCompletedForUse:false,
  executionAuthority:false,liveModelConnected:false,persistentMemory:false,
  studentDataUsed:false,transcriptStored:false,canonPromotion:false
 };
}
export async function runFictionalDemonstration(){
 const outcomes={};
 for(const audience of ["adult","student"]){
  const {principal,pilot}=pilotFor(audience);
  const p=await pilot.propose({
   principal,sourceMentorId:"archaemenes",
   targetMentorId:"zelle",objectiveId:"historical-artwork"
  });
  if(p.status!=="consent-required")throw Error("proposal withheld");
  const approved=await pilot.approve({
   principal,requestId:p.requestId,consentEvidence:labEvidence,
   guardianEvidence:audience==="student"?labEvidence:undefined
  });
  if(approved.status!=="ready-for-single-use-review")throw Error("synthetic approval withheld");
  const release=await pilot.release({principal,requestId:p.requestId});
  if(release.status!=="review-envelope-ready")throw Error("release withheld");
  const result=assembleFictionalLearningCapsule({
   envelope:release.envelope,discoveryIndex:index,governance,catalog,
   knowledgePackets:audience==="adult"?[eirenPacket("zelle")]:[],
   reviewEnabled:true
  });
  if(result.status!=="fictional-capsule-preview")throw Error("capsule withheld");
  outcomes[audience]={simulatedConsent:true,capsule:result.capsule};
 }
 const {principal,pilot}=pilotFor("student");
 const p=await pilot.propose({
  principal,sourceMentorId:"archaemenes",targetMentorId:"eiren",objectiveId:"historical-poetry"
 });
 const revoked=await pilot.revoke({principal,requestId:p.requestId});
 const replay=await pilot.release({principal,requestId:p.requestId});
 return Object.freeze({
  schema:"vnv-fictional-mentor-collaboration-report-v1",
  realConsentVerified:false,liveMentorInvoked:false,
  networkRequests:0,studentRecordsWritten:0,
  ...outcomes,revocation:{status:revoked.status,replayStatus:replay.status}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
 runFictionalDemonstration().then(
  result=>process.stdout.write(JSON.stringify(result,null,2)+"\n"),
  ()=>{process.stderr.write("WITHHOLD: fictional lab test failed\n");process.exitCode=1;}
 );
