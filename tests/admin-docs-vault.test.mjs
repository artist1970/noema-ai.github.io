import test from "node:test";
import assert from "node:assert/strict";
import { AdminDocsVault } from "../storage/admin-docs-vault.js";
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

test("admin docs vault stores and retrieves a document with IndexedDB-style fallback", async () => {
  const fabric = new StorageFabric({
    metadataCloud: new TestCloud(),
    largeObjectStore: largeStub
  });
  const vault = new AdminDocsVault({ fabric });

  const file = new Blob(["hello admin vault"], { type: "text/plain" });
  Object.defineProperty(file, "name", { value: "hello.txt" });

  const saved = await vault.saveFile(file, {
    folder: "Tests",
    useLargeStore: false
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.metadata.backend, "indexeddb");

  const listed = await vault.list();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, "hello.txt");

  const loaded = await vault.getFile(saved.metadata.id);
  assert.equal(await loaded.blob.text(), "hello admin vault");

  const blocked = await vault.deleteFile(saved.metadata.id);
  assert.equal(blocked.ok, false);

  const deleted = await vault.deleteFile(
    saved.metadata.id,
    { confirmed: true }
  );
  assert.equal(deleted.ok, true);
});
