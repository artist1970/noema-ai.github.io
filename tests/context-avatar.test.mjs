import test from "node:test";
import assert from "node:assert/strict";
import {buildNoemaContext} from "../core/context-builder.js";

test("context receives mentor behavior but not appearance details",()=>{
  const context=buildNoemaContext({
    avatar:{
      mentorId:"m1",displayName:"Luna",status:"adopted",
      creationMode:"sketch",temperament:"curious",
      traits:["patient"],collaboration:["show-examples"],
      sharedInterests:["art"],voice:{style:"warm"},supervisor:"noema",
      appearance:{skinTone:"tone-08",hairColor:"violet"}
    }
  });
  assert.equal(context.avatar.displayName,"Luna");
  assert.equal(context.avatar.temperament,"curious");
  assert.equal("appearance" in context.avatar,false);
});
