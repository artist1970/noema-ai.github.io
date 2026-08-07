import test from "node:test";
import assert from "node:assert/strict";
import {createNoemaProviderRequest} from "../providers/noema-protocol.js";

test("provider protocol never requests chain of thought or autonomous authority",()=>{
  const req=createNoemaProviderRequest({
    message:"Hello",
    research:{required:true,domain:"news",status:"unexamined"}
  });
  assert.equal(req.responseContract.chainOfThoughtRequested,false);
  assert.equal(req.responseContract.permissionChangesAllowed,false);
  assert.equal(req.responseContract.memoryWritesAllowed,false);
  assert.equal(req.responseContract.autonomousActionsAllowed,false);
});
