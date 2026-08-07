import test from "node:test";
import assert from "node:assert/strict";
import {SessionEngine} from "../conversation/session-engine.js";

test("conversation session is transient and bounded",()=>{
  const s=new SessionEngine({maxMessages:12});
  for(let i=0;i<20;i++) s.add({role:"user",content:`m${i}`});
  assert.equal(s.list().length,12);
  assert.equal(s.status().persisted,false);
  assert.equal(s.status().rawAudioStored,false);
});
