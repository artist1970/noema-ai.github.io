import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import {loadNaibAditContract,validateAditNaibRequest,createAditNaibProposal} from "../integrations/adit-stos/naib-adit-boundary.js";

const contract=loadNaibAditContract();

test("ADIT contract preserves NAIB triangulated identity",()=>{
  assert.equal(contract.identity.public,"NAIB");
  assert.equal(contract.identity.publicFront,"artist1970/NAIB.github.io");
  assert.equal(contract.identity.protectedRuntime,"artist1970/noema-ai.github.io");
  assert.equal(contract.identity.privateGovernanceCore,"artist1970/CORE/NAIBCore");
});

test("ADIT boundary is proposal-only and denies direct 9844",()=>{
  assert.equal(contract.authority,"proposal-only");
  assert.equal(contract.routing.direct9844Proxy,false);
  assert.equal(contract.routing.directBrowserIngress,false);
});

test("bounded route proposal is allowed",()=>{
  const d=validateAditNaibRequest({intent:"route.propose",goal:"Find the appropriate specialist."});
  assert.equal(d.allowed,true);
  assert.equal(d.code,"ALLOW_PROPOSAL");
});

test("unknown intent fails closed",()=>{
  const d=validateAditNaibRequest({intent:"something.new",goal:"test"});
  assert.equal(d.allowed,false);
  assert.equal(d.code,"INTENT_NOT_ALLOWLISTED");
});

test("execution and mutation intents are denied",()=>{
  for(const intent of ["execute","shell.execute","terminal.input","repository.write","runtime.restart","internal-cloud.write"]){
    const d=validateAditNaibRequest({intent});
    assert.equal(d.allowed,false,intent);
    assert.equal(d.code,"INTENT_DENIED",intent);
  }
});

test("secret-like argument keys are rejected recursively",()=>{
  const d=validateAditNaibRequest({intent:"route.propose",context:{nested:{adminToken:"redacted-value"}}});
  assert.equal(d.allowed,false);
  assert.equal(d.code,"INVALID_ARGUMENTS");
  assert.match(d.reason,/forbidden-secret-key/);
});

test("proposal envelope cannot request authority",()=>{
  const result=createAditNaibProposal({
    requestId:"r-1",
    intent:"specialist.propose",
    goal:"Select a music specialist",
    specialistHints:["moirai","moirai"],
    capabilities:["specialist.route"],
    evidence:["current-request"]
  });
  assert.equal(result.ok,true);
  assert.equal(result.proposal.executionRequested,false);
  assert.equal(result.proposal.mutationRequested,false);
  assert.equal(result.proposal.adminRequested,false);
  assert.equal(result.proposal.secretAccessRequested,false);
  assert.equal(result.proposal.cloudWriteRequested,false);
  assert.equal(result.proposal.dispatchPerformed,false);
  assert.deepEqual(result.proposal.specialistHints,["moirai"]);
  assert.match(result.proposal.proposalSha256,/^[a-f0-9]{64}$/);
});

test("live internal cloud remains direct-write denied",()=>{
  assert.equal(contract.preservation.liveInternalCloud,"naib_internal_cloud_v1");
  assert.equal(contract.preservation.liveCloudDirectWriteFromAdit,false);
});

test("dormant compatibility chassis remains present and unactivated",()=>{
  const html=fs.readFileSync(new URL("../internal/core/noema-core.html",import.meta.url),"utf8");
  assert.match(html,/Dormant compatibility chassis/i);
  assert.match(html,/nmc_v1/);
  assert.doesNotMatch(fs.readFileSync(new URL("../index.html",import.meta.url),"utf8"),/noema-core\.html/);
});

test("ADIT boundary source contains no dispatch or cloud write implementation",()=>{
  const source=fs.readFileSync(new URL("../integrations/adit-stos/naib-adit-boundary.js",import.meta.url),"utf8");
  assert.doesNotMatch(source,/fetch\s*\(/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/WebSocket\s*\(/);
  assert.doesNotMatch(source,/child_process|execSync|spawnSync/);
});
