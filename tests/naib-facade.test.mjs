import test from "node:test";
import assert from "node:assert/strict";
import {NaibFacade} from "../front/naib-facade.js";

test("NAIB facade preserves NOEMA as administrative authority",async()=>{
  const fake={
    respond:async()=>({response:{text:"hello"}}),
    route:()=>({}),
    getCapabilities:()=>[],
    checkCapability:()=>({allowed:true}),
    rememberExchange:()=>{},
    clearNoemaData:()=>{},
    getSystemStatus:()=>({identity:"NOEMA"})
  };
  const naib=new NaibFacade({noemaCore:fake});
  const out=await naib.respond("hello");
  assert.equal(out.publicIdentity.name,"NAIB");
  assert.equal(out.administrativeAuthority.name,"NOEMA");
});
