import test from "node:test";
import assert from "node:assert/strict";
import {NaibFacade} from "../front/naib-facade.js";

function makeInternalRoute() {
  return {
    message:"Help me with a painting",
    role:"adult",
    mode:{id:"creative"},
    context:{
      identity:{
        id:"noema",
        name:"Noema",
        descriptor:"Chancellor of Institutional Integrity"
      },
      persona:{
        publicFacing:false,
        presentation:"internal",
        publicInterface:"naib"
      },
      project:{
        id:"project-1",
        title:"Studio",
        status:"active"
      }
    }
  };
}

function makeNoemaCore() {
  return {
    async respond() {
      return {
        route:makeInternalRoute(),

        response:{
          text:"NAIB coordinated the request.",
          warnings:[]
        },

        providerResponse:{
          text:"NOEMA preserved the internal routing state.",
          provider:"local-test",
          generatedByModel:false
        },

        orchestration:{
          tasks:[
            {
              id:"understand",
              specialistId:"noema",
              status:"complete"
            },
            {
              id:"visual",
              specialistId:"zelle",
              status:"handoff"
            },
            {
              id:"synthesize",
              specialistId:"noema",
              status:"complete"
            }
          ]
        },

        delegation:{
          primary:"NOEMA",
          specialists:["zelle"]
        },

        trace:{
          delegation:{
            primary:"NOEMA",
            specialists:["zelle"]
          }
        }
      };
    },

    route() {
      return makeInternalRoute();
    },

    getCapabilities() {
      return [];
    },

    checkCapability() {
      return {allowed:false,reason:"test"};
    },

    rememberExchange(input={}) {
      return input;
    },

    clearNoemaData() {
      return undefined;
    },

    getSystemStatus() {
      return {
        identity:"NOEMA",
        role:"adult",
        constitution:{active:true},
        security:{active:true}
      };
    }
  };
}

test("NAIB facade hides Noema identity and persona from public responses",async()=>{
  const facade=new NaibFacade({noemaCore:makeNoemaCore()});
  const result=await facade.respond("Help me with a painting");

  assert.equal(result.publicIdentity.name,"NAIB");
  assert.equal(result.publicIdentity.title,"Public Intelligence Director");
  assert.equal(result.publicIdentity.role,"front-facing intelligence");

  assert.equal(result.route.context.identity,undefined);
  assert.equal(result.route.context.persona,undefined);

  // Ordinary non-sensitive context remains available.
  assert.equal(result.route.context.project.title,"Studio");

  assert.equal(result.administrativeAuthority.name,"Internal Governance");
  assert.equal(result.administrativeAuthority.publicNameExposed,false);
});

test("NAIB facade masks internal Noema coordination labels in the public copy",async()=>{
  const facade=new NaibFacade({noemaCore:makeNoemaCore()});
  const result=await facade.respond("Help me with a painting");

  assert.equal(result.delegation.primary,"NAIB");
  assert.equal(result.trace.delegation.primary,"NAIB");

  const understand=result.orchestration.tasks.find(task=>task.id==="understand");
  const visual=result.orchestration.tasks.find(task=>task.id==="visual");
  const synthesize=result.orchestration.tasks.find(task=>task.id==="synthesize");

  assert.equal(understand.specialistId,"naib");
  assert.equal(synthesize.specialistId,"naib");

  // Specialist identities must remain intact.
  assert.equal(visual.specialistId,"zelle");
  assert.deepEqual(result.delegation.specialists,["zelle"]);
});

test("NAIB facade masks Noema in public provider fallback text",async()=>{
  const facade=new NaibFacade({noemaCore:makeNoemaCore()});
  const result=await facade.respond("Help me with a painting");

  assert.equal(
    result.providerResponse.text,
    "NAIB preserved the internal routing state."
  );

  assert.equal(
    /\bNOEMA\b/i.test(result.providerResponse.text),
    false
  );
});

test("NAIB route method also removes internal identity and persona",()=>{
  const facade=new NaibFacade({noemaCore:makeNoemaCore()});
  const route=facade.route("Help me with a painting");

  assert.equal(route.context.identity,undefined);
  assert.equal(route.context.persona,undefined);
  assert.equal(route.context.project.title,"Studio");
});

test("NAIB status exposes public identity but not Noema's name",()=>{
  const facade=new NaibFacade({noemaCore:makeNoemaCore()});
  const status=facade.getStatus();

  assert.equal(status.identity.id,"naib");
  assert.equal(status.identity.name,"NAIB");
  assert.equal(status.administration.identity,"internal-governance");
  assert.equal(status.administration.publicNameExposed,false);

  assert.equal(
    Object.values(status.administration).includes("NOEMA"),
    false
  );
});
