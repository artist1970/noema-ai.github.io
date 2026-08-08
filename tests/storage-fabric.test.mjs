import test from "node:test";
import assert from "node:assert/strict";
import { fabricNamespace, normalizeStorageBranch } from "../storage/storage-fabric-schema.js";
import { StorageFabric } from "../storage/storage-fabric.js";

class TestCloud {
  constructor(){ this.map = new Map(); }
  async initialize(){ return { ok:true, backend:"memory-test", persistence:{supported:false,persisted:false} }; }
  async put(namespace,key,value,options={}){
    const id=`${namespace}::${key}`;
    const record={id,namespace,key,bytes:value instanceof Blob?value.size:0,updatedAt:new Date().toISOString(),metadata:options.metadata||{}};
    this.map.set(id,{record,value});
    return {ok:true,record};
  }
  async get(namespace,key){ return this.map.get(`${namespace}::${key}`) || null; }
  async list(namespace=""){ return [...this.map.values()].map(x=>x.record).filter(x=>!namespace||x.namespace===namespace); }
  async delete(namespace,key,{confirmed=false}={}){
    if(!confirmed)return {ok:false};
    return {ok:this.map.delete(`${namespace}::${key}`)};
  }
  async status(){ return {id:"test-cloud",browserQuota:null,browserUsage:null}; }
  async requestPersistence(){ return {supported:false,persisted:false}; }
}

const largeStub = {
  supported: false,
  initialize: async () => ({ ok: false, backend: "unavailable" }),
  status: async () => ({ supported: false, backend: "unavailable" })
};

test("storage fabric keeps the four branches distinct", () => {
  assert.equal(normalizeStorageBranch("internal"), "internal");
  assert.equal(normalizeStorageBranch("account"), "account");
  assert.equal(normalizeStorageBranch("communication"), "communication");
  assert.equal(normalizeStorageBranch("admin"), "admin");
  assert.equal(fabricNamespace("admin", "docs"), "fabric-admin-docs");
  assert.notEqual(
    fabricNamespace("account", "records"),
    fabricNamespace("communication", "records")
  );
});

test("storage fabric works without external dependencies", async () => {
  const fabric = new StorageFabric({
    metadataCloud: new TestCloud(),
    largeObjectStore: largeStub
  });

  await fabric.put("account", "records", "sample", { ok: true });
  await fabric.put("communication", "archive", "sample", { queued: false });
  await fabric.put("admin", "notes", "sample", { title: "Admin note" });

  assert.deepEqual((await fabric.get("account", "records", "sample")).value, { ok: true });
  assert.deepEqual((await fabric.get("communication", "archive", "sample")).value, { queued: false });
  assert.deepEqual((await fabric.get("admin", "notes", "sample")).value, { title: "Admin note" });
});
