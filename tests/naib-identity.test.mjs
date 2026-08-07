import test from "node:test";
import assert from "node:assert/strict";
import {getNaibIdentity} from "../front/naib-identity.js";

test("NAIB is public while NOEMA remains administrative",()=>{
  const id=getNaibIdentity();
  assert.equal(id.name,"NAIB");
  assert.equal(id.administrativeAuthority,"NOEMA");
  assert.match(id.role,/front-facing/i);
});
