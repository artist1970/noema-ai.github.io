import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {NAIB_PUBLIC_CONTRACT} from "../config/naib-public-contract.js";

test("public metadata routes to NAIB while preserving protected runtime governance",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/Verve N Veda Intelligence Gateway/);
  assert.match(html,/https:\/\/artist1970\.github\.io\/NAIB\.github\.io\//);
  assert.equal(NAIB_PUBLIC_CONTRACT.publicFront.repository,"artist1970/NAIB.github.io");
  assert.equal(NAIB_PUBLIC_CONTRACT.runtime.repository,"artist1970/noema-ai.github.io");
  assert.equal(NAIB_PUBLIC_CONTRACT.core.canonicalRef,"artist1970/CORE/NAIBCore");
  assert.equal(NAIB_PUBLIC_CONTRACT.governance.exposeChancellorAsPublicDestination,false);
});
