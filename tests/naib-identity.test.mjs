import test from "node:test";
import assert from "node:assert/strict";
import {getNaibIdentity} from "../front/naib-identity.js";

test("NAIB public identity does not expose the internal administrative name",()=>{
  const id=getNaibIdentity();
  assert.equal(id.name,"NAIB");
  assert.equal(id.administrativeAuthority,"internal-governance");
  assert.match(id.role,/front-facing/i);
  assert.equal(JSON.stringify(id).includes("NOEMA"),false);
});
