import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMentorDiscoveryIndex,suggestMentorRoute} from "../delegation/mentor-discovery-v1.mjs";
import {routeMentorRequest,ROUTABLE_MENTORS} from "../delegation/mentor-router.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=load("../config/mentor-registry.json");
const publicRoster=load("../config/creative-spark-roster-alignment.v1.json");
const governance=load("../config/noema-naib-governance-discovery.v1.json");
const index=buildMentorDiscoveryIndex({registry,publicRoster,governance});
const ask=(prompt,options={})=>suggestMentorRoute(index,{prompt,audience:"student",...options});

test("governing hierarchy and 13 public specialist identities align",()=>{
 assert.equal(index.status,"aligned");assert.equal(index.entries.length,13);
 assert.equal(index.chancellor,"noema");assert.equal(index.administrator,"naib");
 assert.equal(governance.administrator.reportsTo,"noema");
 assert.deepEqual(governance.administrator.duties,["understand","organize","study","preserve"]);
 assert.equal(index.liveModelConnected,false);assert.equal(index.executed,false);
});
test("Eiren and Moirai handoffs are references, not live language models",()=>{
 for(const [prompt,id] of [["Explain a poem","eiren"],["Teach me melody","moirai"]]){
  const result=ask(prompt);
  assert.equal(result.status,"handoff-proposal");
  assert.equal(result.candidates[0].id,id);
  assert.equal(result.candidates[0].handoffEligible,true);
  assert.equal(result.candidates[0].liveModelConnected,false);
 }
 assert.deepEqual(ROUTABLE_MENTORS,["eiren","moirai"]);
});
test("unverified public mentors remain discovery-only",()=>{
 for(const [query,id] of [["Sketch a painting","zelle"],["Practice French","pierre"],
  ["Explore an archival record","arshif"],["Teach algebra","archaemenes"],
  ["Explain document lineage","auren"],["Mindfulness meditation","aurora"],
  ["Help with Python code","codalis"]]){
  const result=ask(query);
  assert.equal(result.status,"discovery-proposal",query);
  assert.equal(result.candidates[0].id,id,query);
  assert.equal(result.candidates[0].handoffEligible,false);
 }
});
test("two specialties require a human choice; no prompt is echoed",()=>{
 const result=ask("I want poetry lyrics for music");
 assert.equal(result.status,"choice-required");
 assert.deepEqual(result.candidates.map(x=>x.id),["eiren","moirai"]);
 assert.equal(result.requiresUserChoice,true);
 assert.equal(Object.hasOwn(result,"prompt"),false);
});
test("NOEMA, NAIB and KlasaiPeer are never auto-selected as specialists",()=>{
 for(const id of ["noema","naib","klasaipeer"])
  assert.equal(ask("",{selectedMentorId:id}).status,"withheld");
});
test("Hope requires named, explicit adult choice and otherwise withholds",()=>{
 assert.equal(ask("Find housing and benefits").status,"unmatched");
 assert.equal(ask("",{selectedMentorId:"hope",explicitRequest:true}).status,"withheld");
 assert.equal(ask("",{selectedMentorId:"hope",audience:"adult"}).status,"withheld");
 const x=ask("",{selectedMentorId:"hope",audience:"adult",explicitRequest:true});
 assert.equal(x.status,"discovery-proposal");
 assert.equal(x.candidates[0].handoffEligible,false);
});
test("unknown audience and secret-bearing prompts fail closed",()=>{
 assert.equal(suggestMentorRoute(index,{prompt:"melody"}).status,"withheld");
 for(const prompt of ["my password is abc","private key here","x".repeat(401)])
  assert.equal(ask(prompt).status,"withheld");
});
test("registry URL drift and hierarchy drift block every recommendation",()=>{
 const badRoster=structuredClone(publicRoster);
 badRoster.mentors[0].url="https://attacker.example/";
 assert.equal(buildMentorDiscoveryIndex({registry,publicRoster:badRoster,governance}).status,"withheld");
 const badGovernance=structuredClone(governance);
 badGovernance.administrator.reportsTo="visitor";
 assert.equal(buildMentorDiscoveryIndex({registry,publicRoster,governance:badGovernance}).status,"withheld");
});
test("unapproved fake adapters never become verified handoffs",()=>{
 const fake=structuredClone(registry);
 fake.mentors.find(x=>x.id==="zelle").adapter="../adapters/eiren-adapter.js";
 const localIndex=buildMentorDiscoveryIndex({registry:fake,publicRoster,governance});
 const x=suggestMentorRoute(localIndex,{prompt:"painting",audience:"adult"});
 assert.equal(x.status,"discovery-proposal");
 assert.equal(x.candidates[0].handoffEligible,false);
});
test("existing two-specialist NAIB handoff is unchanged",()=>{
 assert.equal(routeMentorRequest({prompt:"write a poem"}).specialist,"eiren");
 assert.equal(routeMentorRequest({prompt:"make a melody"}).specialist,"moirai");
 assert.equal(routeMentorRequest({prompt:"poetry and music"}).requiresUserChoice,true);
});
test("no private learner state, execution or runtime is available",()=>{
 const result=ask("geometry");
 assert.equal(result.executed,false);
 assert.equal(result.studentDataUsed,false);
 assert.equal(result.transcriptStored,false);
 assert.equal(result.canonPromotion,false);
 assert.equal(result.hturtVerified,false);
 assert.equal(result.persistentMemory,false);
});
