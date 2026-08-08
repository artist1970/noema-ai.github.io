import test from "node:test";
import assert from "node:assert/strict";
import { DictionarySovereignCloud } from "../storage/dictionary-sovereign-cloud.js";

class FabricStub {
  constructor(){ this.map = new Map(); this.largeObjects = { supported:false }; }
  async initialize(){ return { ok:true }; }
  key(branch,bucket,key){ return `${branch}:${bucket}:${key}`; }
  async put(branch,bucket,key,value){ this.map.set(this.key(branch,bucket,key), value); return {ok:true}; }
  async get(branch,bucket,key){ const value=this.map.get(this.key(branch,bucket,key)); return value===undefined?null:{value}; }
  async list(branch,bucket){
    const prefix=`${branch}:${bucket}:`;
    return [...this.map.keys()].filter(key=>key.startsWith(prefix)).map(key=>({key:key.slice(prefix.length)}));
  }
  async delete(branch,bucket,key,{confirmed=false}={}){
    if(!confirmed)return {ok:false};
    return {ok:this.map.delete(this.key(branch,bucket,key))};
  }
  async putLarge(){ return {ok:false}; }
  async getLarge(){ return null; }
  async deleteLarge(){ return {ok:false}; }
  async status(){ return {id:"fabric-stub"}; }
}

test("stores core letter collections inside the dictionary branch", async () => {
  const cloud = new DictionarySovereignCloud({ fabric:new FabricStub() });
  await cloud.putCoreLetter("A", {letter:"A",entries:[{word:"apple",definition:"A fruit."}]});
  const payload = await cloud.getCoreLetter("A");
  assert.equal(payload.letter,"A");
  assert.equal(payload.entries[0].word,"apple");
});

test("stores access indexes separately from canonical letter data", async () => {
  const cloud = new DictionarySovereignCloud({ fabric:new FabricStub() });
  await cloud.putAccessIndex("length","3",{length:3,words:[{word:"cat",letter:"C",length:3}]});
  const index = await cloud.getAccessIndex("length","3");
  assert.equal(index.length,3);
  assert.equal(index.words[0].word,"cat");
  assert.equal(await cloud.getCoreLetter("L"),null);
});

test("extended shards fall back to structured storage and require confirmation to delete", async () => {
  const cloud = new DictionarySovereignCloud({ fabric:new FabricStub() });
  const saved = await cloud.putExtendedShard("wordnet-aa", {entries:["alpha"]}, {forceStructured:true});
  assert.equal(saved.meta.backend,"indexeddb");
  const loaded = await cloud.getExtendedShard("wordnet-aa");
  assert.deepEqual(loaded.payload,{entries:["alpha"]});
  assert.equal((await cloud.deleteExtendedShard("wordnet-aa")).ok,false);
  assert.equal((await cloud.deleteExtendedShard("wordnet-aa",{confirmed:true})).ok,true);
});
