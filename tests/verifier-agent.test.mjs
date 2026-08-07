import test from "node:test";
import assert from "node:assert/strict";
import {VerifierAgent} from "../research/verifier-agent.js";

function storage(){
  const m=new Map();
  return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
}

test("new verifier session is not automatically verified",()=>{
  const v=new VerifierAgent({storage:storage()});
  const session=v.createSession("A factual claim",{domain:"general"});
  assert.notEqual(session.verdict.status,"verified-fact");
});

test("Verifier source record can carry opposition",()=>{
  const v=new VerifierAgent({storage:storage()});
  let session=v.createSession("A factual claim",{domain:"general"});
  session=v.addSource(session,{title:"Source",relation:"opposing",confidence:"high",level:"primary",independenceFamily:"x"});
  assert.equal(session.sources[0].relation,"opposing");
});
