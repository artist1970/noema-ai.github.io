import test from "node:test";
import assert from "node:assert/strict";
import {normalizeProviderConfig} from "../config/provider-config.js";

test("remote provider is disabled by default",()=>{
  const x=normalizeProviderConfig({});
  assert.equal(x.remote.enabled,false);
  assert.equal(x.remote.baseUrl,"");
});

test("remote provider requires https outside localhost",()=>{
  assert.throws(()=>normalizeProviderConfig({
    activeProvider:"secure-http",
    remote:{enabled:true,baseUrl:"http://example.com"}
  }),/HTTPS/);
});

test("provider URL cannot contain credentials",()=>{
  assert.throws(()=>normalizeProviderConfig({
    remote:{enabled:true,baseUrl:"https://user:secret@example.com"}
  }),/credentials/i);
});
