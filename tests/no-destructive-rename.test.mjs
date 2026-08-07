import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("existing NOEMA administrative storage keys are preserved",()=>{
  const files=[
    "../identity/enrollment-store.js",
    "../identity/mentor-relationship-store.js",
    "../research/verifier-session-store.js",
    "../voice/voice-controller.js"
  ].map(x=>fs.readFileSync(new URL(x,import.meta.url),"utf8")).join("\n");

  assert.match(files,/noema_/);
});
