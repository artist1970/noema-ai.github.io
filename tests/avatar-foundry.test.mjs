import test from "node:test";
import assert from "node:assert/strict";
import {AvatarFoundry} from "../avatars/avatar-foundry.js";

function memoryStorage(){
  const m=new Map();
  return {
    getItem:k=>m.get(k)??null,
    setItem:(k,v)=>m.set(k,v),
    removeItem:k=>m.delete(k)
  };
}

test("foundry preserves stable mentor relationship id",()=>{
  const storage=memoryStorage();
  const relationships={load:()=>({mentorId:"mentor_stable_123"})};
  const enrollment={load:()=>({ageBand:"adult-18-plus",accountPathway:"independent-adult"})};
  const foundry=new AvatarFoundry({storage,relationshipStore:relationships,enrollmentStore:enrollment});
  const saved=foundry.saveDraft({displayName:"Elias"});
  const adopted=foundry.adopt({displayName:"Elias"});
  assert.equal(saved.ok,true);
  assert.equal(adopted.ok,true);
  assert.equal(saved.avatar.mentorId,adopted.avatar.mentorId);
});

test("sketch adoption requires a saved source sketch",()=>{
  const storage=memoryStorage();
  const foundry=new AvatarFoundry({
    storage,
    relationshipStore:{load:()=>({mentorId:"mentor_stable_123"})},
    enrollmentStore:{load:()=>({ageBand:"adult-18-plus"})}
  });
  const result=foundry.adopt({displayName:"Sketchy",creationMode:"sketch"});
  assert.equal(result.ok,false);
});
