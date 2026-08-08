import test from "node:test";
import assert from "node:assert/strict";
import {NaibFacade} from "../front/naib-facade.js";

test("NAIB facade keeps administrative identity internal",async()=>{
  const fake={
    respond:async()=>({response:{text:"hello"}}),
    route:()=>({}),
    getCapabilities:()=>[],
    checkCapability:()=>({allowed:true}),
    rememberExchange:()=>{},
    clearNoemaData:()=>{},
    getSystemStatus:()=>({identity:"internal"})
  };
  const naib=new NaibFacade({noemaCore:fake});
  const out=await naib.respond("hello");
  assert.equal(out.publicIdentity.name,"NAIB");
  assert.equal(out.administrativeAuthority.name,"Internal Governance");
  assert.equal(out.administrativeAuthority.publicNameExposed,false);
});
