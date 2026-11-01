import test from "node:test";
import assert from "node:assert/strict";
import {MentorCouncil} from "./coordinator.mjs";

test("requires explicit authorizer",()=>assert.throws(()=>new MentorCouncil(),/authorization/));
test("refuses unsupported adapter identities",()=>{const c=new MentorCouncil({authorize:async()=>true});assert.throws(()=>c.register("noema",async()=>({})),/unapproved/);});
test("invites real independent adapter functions and preserves source labels",async()=>{
 const calls=[];
 const c=new MentorCouncil({authorize:async()=>true,adapters:{
  auren:async ({prompt,prior})=>{calls.push(["auren",prior.length]);return {status:"ok",kind:"live-mentor",content:"Archivist: "+prompt,sources:["source:verified"],runtimeId:"synthetic-auren-test"}},
  eiren:async ({prompt,prior})=>{calls.push(["eiren",prior.length]);return {status:"ok",kind:"live-mentor",content:"Literary: "+prompt,sources:["source:literature"],runtimeId:"synthetic-eiren-test"}}
 }});
 await c.begin({principal:"test-owner",sessionId:"session_0001",invited:["auren","eiren"]});
 const answer=await c.ask({principal:"test-owner",sessionId:"session_0001",message:"Discuss provenance and poetry"});
 assert.equal(answer.replies.length,2);assert.deepEqual(answer.replies.map(x=>x.status),["ok","ok"]);
 assert.deepEqual(calls,[["auren",0],["eiren",0]]);assert.equal(answer.replies[0].sources[0],"source:verified");
 const second=await c.ask({principal:"test-owner",sessionId:"session_0001",message:"Continue"});
 assert.equal(second.replies.length,2);assert.equal(calls[2][1],3);
 await c.end({principal:"test-owner",sessionId:"session_0001"});
 await assert.rejects(()=>c.ask({principal:"test-owner",sessionId:"session_0001",message:"Again"}),/not authorized/);
});
test("never calls missing adapters and reports unavailable",async()=>{
 const c=new MentorCouncil({authorize:async()=>true});
 await c.begin({principal:"owner",sessionId:"room_12345",invited:["hope"]});
 const result=await c.ask({principal:"owner",sessionId:"room_12345",message:"Hello"});
 assert.equal(result.replies[0].status,"adapter-unavailable");assert.equal(result.dispatched,false);
});
test("rejects denied authentication and another principal",async()=>{
 const c=new MentorCouncil({authorize:async({principal})=>principal==="owner"});
 await assert.rejects(()=>c.begin({principal:"stranger",sessionId:"other_1234",invited:["auren"]}),/not authorized/);
 await c.begin({principal:"owner",sessionId:"room_12345",invited:["auren"]});
 await assert.rejects(()=>c.ask({principal:"stranger",sessionId:"room_12345",message:"Hello"}),/not authorized/);
 await assert.rejects(()=>c.ask({principal:"owner",sessionId:"room_12345",message:"Here is my password"}),/secret-bearing/);
});
test("malformed adapter output never becomes a claimed live reply",async()=>{
 const c=new MentorCouncil({authorize:async()=>true,adapters:{auren:async()=>({status:"ok",content:"hi",kind:"live-mentor"})}});
 await c.begin({principal:"owner",sessionId:"room_12345",invited:["auren"]});
 const result=await c.ask({principal:"owner",sessionId:"room_12345",message:"Hello"});
 assert.equal(result.replies[0].status,"adapter-error");
});
