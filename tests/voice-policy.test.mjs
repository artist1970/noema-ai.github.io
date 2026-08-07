import test from "node:test";
import assert from "node:assert/strict";
import {RECOGNITION_POLICY} from "../voice/push-to-talk.js";

test("voice input cannot be continuous, background or auto-send",()=>{
  assert.equal(RECOGNITION_POLICY.continuous,false);
  assert.equal(RECOGNITION_POLICY.backgroundListening,false);
  assert.equal(RECOGNITION_POLICY.autoSend,false);
  assert.equal(RECOGNITION_POLICY.audioStorage,false);
});
