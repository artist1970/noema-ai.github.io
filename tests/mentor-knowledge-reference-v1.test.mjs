import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMentorDiscoveryIndex} from "../delegation/mentor-discovery-v1.mjs";
import {acceptKnowledgeReference} from "../delegation/mentor-knowledge-reference-v1.mjs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=load("../config/mentor-registry.json");
const publicRoster=load("../config/creative-spark-roster-alignment.v1.json");
const governance=load("../config/noema-naib-governance-discovery.v1.json");
const catalog=load("../config/creative-spark-approved-knowledge-sources.v1.json");
const discoveryIndex=buildMentorDiscoveryIndex({registry,publicRoster,governance});
function packet(overrides={}){
 return{
  schema:"creative-spark-approved-knowledge-reference-v1",version:1,purpose:"offline-review-only",
  requestMentorId:"eiren",sourceMentorId:"zelle",sourceName:"Zelle",
  sourceRepository:"artist1970/Zelle.github.io",
  sourcePath:"knowledge/question-records.json",
  sourceUrl:"https://artist1970.github.io/Zelle.github.io/knowledge/question-records.json",
  recordId:"zelle-0",topic:"teaching",
  answer:"A publicly approved explanation about color and composition for a fictional lesson.",
  matchMethod:"exact-normalized-question",classification:"approved-public-reference",
  claimState:"source-statement",independentlyCorroborated:false,
  factVerified:false,humanReviewCompletedForUse:false,
  executionAuthority:false,liveModelConnected:false,
  persistentMemory:false,studentDataUsed:false,
  transcriptStored:false,canonPromotion:false,...overrides
 };
}
const accept=(p=packet(),opts={})=>acceptKnowledgeReference({
 discoveryIndex,governance,catalog,packet:p,requestMentorId:"eiren",
 audience:"adult",reviewEnabled:true,...opts
});
test("a pinned nine-source metadata catalog contains 1,354 published records",()=>{
 assert.equal(catalog.totals.publishedSources,9);
 assert.equal(catalog.members.reduce((a,b)=>a+b.recordCount,0),1354);
 assert.equal(catalog.policy.requiresIndependentRuntimeAuthorization,true);
 assert.equal(discoveryIndex.status,"aligned");
});
test("NOEMA and NAIB receive only a source-attributed and non-verified review packet",()=>{
 const r=accept();
 assert.equal(r.status,"reviewable-source-reference");
 assert.equal(r.reference.kind,"credited-approved-public-knowledge");
 assert.equal(r.reference.sourceMentorId,"zelle");
 assert.equal(r.reference.recordId,"zelle-0");
 assert.equal(r.reference.sourceRepository,"artist1970/Zelle.github.io");
 assert.equal(r.reference.claimState,"source-statement");
 assert.equal(r.reference.factVerified,false);
 assert.equal(r.reference.passedToLiveMentor,false);
 assert.equal(r.executionAuthority,false);
 assert.equal(Object.isFrozen(r.reference),true);
});
test("the bridge stays closed unless explicitly enabled in a local review",()=>{
 assert.equal(accept(packet(),{reviewEnabled:false}).status,"withheld");
 assert.equal(accept(packet(),{audience:"student"}).reason,"youth-suitability-review-required");
 assert.equal(accept(packet(),{audience:"child"}).status,"withheld");
});
test("a forged Chancellor role or unaligned registry blocks the reference",()=>{
 const fake=structuredClone(governance);fake.administrator.reportsTo="self";
 assert.equal(accept(packet(),{governance:fake}).status,"withheld");
 const bad=structuredClone(discoveryIndex);bad.chancellor="naib";
 assert.equal(accept(packet(),{discoveryIndex:bad}).status,"withheld");
});
test("source drift, unsafe approval, bogus provider, and extra authority fields fail closed",()=>{
 const mutations=[
  {sourceMentorId:"pierre"},{sourceName:"Arshif"},
  {sourceRepository:"artist1970/CORE"},
  {sourceUrl:"https://malicious.example/qa.json"},
  {sourcePath:"../../private/CORE"},
  {classification:"independently-verified"},
  {claimState:"verified"},{factVerified:true},
  {independentlyCorroborated:true},{humanReviewCompletedForUse:true},
  {executionAuthority:true},{liveModelConnected:true},{persistentMemory:true},
  {canonPromotion:true},{transcriptStored:true},{studentDataUsed:true},
  {adminAuthority:true},{requestMentorId:"noema"},
  {matchMethod:"fuzzy-llm-guess"}
 ];
 for(const v of mutations)assert.equal(accept(packet(v)).status,"withheld",JSON.stringify(v));
});
test("source catalog corruption and source count disagreement fail closed",()=>{
 const bad=structuredClone(catalog);bad.members[0].recordCount++;
 assert.equal(accept(packet(),{catalog:bad}).status,"withheld");
 const fake=structuredClone(catalog);fake.members[0].sourceUrl="https://unknown.example/x";
 assert.equal(accept(packet(),{catalog:fake}).status,"withheld");
});
test("Hope and Aurora sources require independent specialist safety review",()=>{
 for(const id of ["hope","aurora"]){
  const row=catalog.members.find(x=>x.mentorId===id);
  assert.equal(accept(packet({sourceMentorId:id,sourceName:row.name,
   sourceRepository:row.sourceRepository,sourcePath:row.sourcePath,sourceUrl:row.sourceUrl})).status,"withheld");
 }
});
test("requester identity binds to the packet, not the source speaker",()=>{
 assert.equal(accept(packet(),{requestMentorId:"pierre"}).status,"withheld");
 assert.equal(accept(packet(),{requestMentorId:"noema"}).status,"withheld");
 assert.equal(accept(packet(),{requestMentorId:"klasaipeer"}).status,"withheld");
});
test("secret and high-stakes content is refused, not echoed or saved",()=>{
 for(const answer of ["My password is abc 123","This includes a medical diagnosis",
  "Publish this student's grade record","Publish my grade record",
  "Tell me the locked exam answer key"]){
  const r=accept(packet({answer}));
  assert.equal(r.status,"withheld");assert.equal(r.reference,null);
  assert.doesNotMatch(JSON.stringify(r),/password is abc|grade record|answer key/);
 }
});
test("source-only module has no transport, private CORE imports, or storage",()=>{
 const path=new URL("../delegation/mentor-knowledge-reference-v1.mjs",import.meta.url);
 const src=readFileSync(path,"utf8");
 assert.doesNotMatch(src,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|child_process|node:net/);
});
