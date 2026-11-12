/**
 * NOEMA / NAIB FICTIONAL Mentor Learning Capsule Laboratory.
 * Pure, review-only consumer of the existing handoff and knowledge contracts.
 * No model, transcript, learner, browser, network, account, or STOS access.
 */
import {acceptKnowledgeReference} from "../delegation/mentor-knowledge-reference-v1.mjs";
import {HANDOFF_SCHEMA} from "../delegation/consented-mentor-handoff-v1.mjs";
export const CAPSULE_SCHEMA="vnv-fictional-mentor-learning-capsule-v1";
const ROUTES=Object.freeze({
 "historical-artwork":["zelle","Explore a historical artwork through visual art","public-discovery-reference-only"],
 "historical-poetry":["eiren","Explore historical themes through a poem","verified-handoff-reference-only"],
 "french-history-vocabulary":["pierre","Practice French vocabulary connected with a history lesson","public-discovery-reference-only"],
 "historical-music":["moirai","Explore rhythm through an original history-themed composition","verified-handoff-reference-only"]
});
const FIELDS=["administrator","audience","chancellor","consentHostCallbackPassed","consentScope",
 "dispatched","executionAuthority","guardianHostCallbackPassed","identityIncluded","liveModelConnected",
 "networkAccess","objectiveId","objectiveLabel","persistentMemory","previousTurnsIncluded","purpose",
 "recipientStatus","reviewOnly","schema","sourceMentorId","studentRecordsIncluded","targetMentorId",
 "transcriptIncluded","version"].sort().join("|");
const reject=reason=>Object.freeze({status:"withheld",reason,capsule:null,delivered:false,executionAuthority:false});
const exact=x=>x&&typeof x==="object"&&!Array.isArray(x)&&Object.keys(x).sort().join("|")===FIELDS;
export function assembleFictionalLearningCapsule({
 envelope,discoveryIndex,governance,catalog,knowledgePackets=[],reviewEnabled=false
}={}){
 if(reviewEnabled!==true)return reject("lab-disabled");
 if(!exact(envelope)||envelope.schema!==HANDOFF_SCHEMA||envelope.version!==1||
  envelope.purpose!=="in-process-review-only"||envelope.chancellor!=="noema"||
  envelope.administrator!=="naib"||envelope.sourceMentorId!=="archaemenes"||
  !["adult","student","child"].includes(envelope.audience)||
  envelope.consentScope!=="one-time-approved-learning-objective"||
  envelope.consentHostCallbackPassed!==true||
  envelope.guardianHostCallbackPassed!==(envelope.audience!=="adult")||
  envelope.transcriptIncluded!==false||envelope.studentRecordsIncluded!==false||
  envelope.previousTurnsIncluded!==false||envelope.identityIncluded!==false||
  envelope.executionAuthority!==false||envelope.liveModelConnected!==false||
  envelope.persistentMemory!==false||envelope.networkAccess!==false||
  envelope.dispatched!==false||envelope.reviewOnly!==true)
   return reject("unapproved-or-privileged-envelope");
 const route=ROUTES[envelope.objectiveId];
 if(!route||route[0]!==envelope.targetMentorId||route[1]!==envelope.objectiveLabel||
  route[2]!==envelope.recipientStatus)return reject("objective-or-recipient-drift");
 if(discoveryIndex?.status!=="aligned"||discoveryIndex.chancellor!=="noema"||
  discoveryIndex.administrator!=="naib"||!Array.isArray(discoveryIndex.entries)||
  !discoveryIndex.entries.some(x=>x.id===route[0])||
  governance?.administrator?.reportsTo!=="noema"||
  governance?.policy?.independentServerAuthorizationRequired!==true)
   return reject("governance-not-aligned");
 if(!Array.isArray(knowledgePackets)||knowledgePackets.length>3)
  return reject("too-many-references");
 if(envelope.audience!=="adult"&&knowledgePackets.length)
  return reject("youth-suitability-review-required");
 const citations=[],seen=new Set();
 for(const packet of knowledgePackets){
  const out=acceptKnowledgeReference({
   discoveryIndex,governance,catalog,packet,requestMentorId:route[0],
   audience:envelope.audience,reviewEnabled:true
  });
  if(out.status!=="reviewable-source-reference")return reject("unapproved-knowledge-packet");
  const x=out.reference,key=x.sourceMentorId+":"+x.recordId;
  if(seen.has(key))return reject("duplicate-reference");
  seen.add(key);
  citations.push(Object.freeze({
   sourceMentorId:x.sourceMentorId,sourceRepository:x.sourceRepository,
   sourcePath:x.sourcePath,sourceUrl:x.sourceUrl,recordId:x.recordId,
   topic:x.topic,excerpt:x.answer,claimState:"source-statement",
   independentlyFactChecked:false,sourceContentRevalidated:false
  }));
 }
 const capsule=Object.freeze({
  schema:CAPSULE_SCHEMA,version:1,
  stage:"FICTIONAL_LAB_ONLY",chancellor:"noema",administrator:"naib",
  sourceMentorId:"archaemenes",targetMentorId:route[0],
  objectiveId:envelope.objectiveId,objectiveLabel:route[1],
  audienceScope:envelope.audience,recipientReadiness:route[2],
  knowledgeReferences:Object.freeze(citations),
  learningContextTransferred:"approved-objective-and-optional-public-references-only",
  introduction:"Not generated: awaiting an independently authorized mentor",
  consentVerification:"synthetic-test-callbacks-only",
  realIdentityVerified:false,realGuardianVerified:false,
  transcriptIncluded:false,identityIncluded:false,studentRecordsIncluded:false,
  persistentMemory:false,executionAuthority:false,networkAccess:false,
  liveMentorConnected:false,delivered:false,productionApproved:false,
  independentFactVerification:false,reviewOnly:true
 });
 return Object.freeze({status:"fictional-capsule-preview",capsule,delivered:false,executionAuthority:false});
}
