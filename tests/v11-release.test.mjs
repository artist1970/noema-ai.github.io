import test from "node:test";
import assert from "node:assert/strict";
import {NAIB_PUBLIC_CONTRACT} from "../config/naib-public-contract.js";

test("release lineage preserves NAIB public / protected governance split",()=>{
  assert.equal(NAIB_PUBLIC_CONTRACT.identity.name,"NAIB");
  assert.equal(NAIB_PUBLIC_CONTRACT.publicFront.canonical,true);
  assert.equal(NAIB_PUBLIC_CONTRACT.core.visibility,"private");
  assert.equal(NAIB_PUBLIC_CONTRACT.core.browserFetchAllowed,false);
  assert.equal(NAIB_PUBLIC_CONTRACT.governance.chancellor,"NOEMA");
  assert.equal(NAIB_PUBLIC_CONTRACT.governance.chancellorVisibility,"private");
});
