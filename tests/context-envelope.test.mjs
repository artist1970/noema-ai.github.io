import test from "node:test";
import assert from "node:assert/strict";
import {buildProviderContextEnvelope} from "../conversation/context-envelope.js";

test("provider context excludes stable IDs and avatar appearance",()=>{
  const env=buildProviderContextEnvelope({
    enrollment:{
      personId:"person-secret-id",
      displayName:"Name",
      ageBand:"teen-13-17",
      accountPathway:"guardian-linked-teen",
      learning:{gradeLevel:"grade-10",interests:["art"]}
    },
    mentorRelationship:{mentorId:"mentor-secret-id",relationshipId:"rel-secret"},
    avatar:{
      mentorId:"mentor-secret-id",
      displayName:"Luna",
      temperament:"curious",
      traits:["patient"],
      appearance:{skinTone:"tone-08",hairColor:"violet",eyeColor:"green"},
      voice:{style:"warm",rate:.95,pitch:1}
    }
  });

  const text=JSON.stringify(env);
  assert.equal(text.includes("person-secret-id"),false);
  assert.equal(text.includes("mentor-secret-id"),false);
  assert.equal(text.includes("tone-08"),false);
  assert.equal(text.includes("violet"),false);
  assert.equal(env.mentor.displayName,"Luna");
});

test("credential-like retained memory is excluded from provider context",()=>{
  const env=buildProviderContextEnvelope({
    memory:{relevant:[
      {title:"safe",content:"I prefer geometry examples.",kind:"preference"},
      {title:"unsafe",content:"My password is sample-secret.",kind:"note"}
    ]}
  });
  assert.equal(env.relevantMemory.length,1);
  assert.equal(env.relevantMemory[0].title,"safe");
});
