/**
 * NOEMA (Chancellor) → NAIB (second-in-command and mentor administrator):
 * approved PUBLIC knowledge reference receiving boundary, review-only.
 *
 * Source data belongs to the 9 mentor-owned Creative Spark Q&A banks. No
 * fetch, student context, model execution, file writes, or authority promotion.
 * Not an STOS/ADIT endpoint. Public metadata SHA is a snapshot ID, not proof
 * of cryptographic approval or an authenticated sender.
 */
export const ACCEPTED_SCHEMA="creative-spark-approved-knowledge-reference-v1";
const KEYS=[
 "answer","canonPromotion","claimState","classification","executionAuthority",
 "factVerified","humanReviewCompletedForUse","independentlyCorroborated",
 "liveModelConnected","matchMethod","persistentMemory","purpose","recordId",
 "requestMentorId","schema","sourceMentorId","sourceName","sourcePath",
 "sourceRepository","sourceUrl","studentDataUsed","topic","transcriptStored","version"
].sort().join("|");
const FORBIDDEN=/\b(?:password|passcode|secret|api[\s-]?key|private[\s-]?key|access[\s-]?token|bearer[\s-]?token|student[\s-]?record|student[\s-]?id|student(?:['’]s)?\s+(?:\w+\s+){0,3}(?:record|grade|transcript)|grade[\s-]?record|academic[\s-]?transcript|learner[\s-]?record|medical[\s-]?record|diagnos\w*|prescri\w*|medical[\s-]?advice|suicid\w*|self[- ]harm|emergency|crisis|legal[\s-]?advice|benefits[\s-]?eligibility|answer[\s-]?key|locked[\s-]?(?:exam|test)|graded[\s-]?assessment|private[\s-]?archive)\b/i;
const CLEAN=/^[\p{L}\p{N}\p{P}\p{Zs}\r\n\t]+$/u;
const OWN=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
function blocked(reason){return Object.freeze({status:"withheld",reason,reference:null,executionAuthority:false});}
function ownsExact(x){
 return x!==null&&typeof x==="object"&&!Array.isArray(x)&&Object.keys(x).sort().join("|")===KEYS;
}
function verifiedCatalog(cat){
 if(!cat||cat.schema!=="noema-approved-mentor-knowledge-sources-v1"||
   cat.version!==1||cat.scope!=="offline-review-only-source-metadata"||
   cat.source?.repository!=="artist1970/creative-spark.github.io"||
   cat.source?.path!=="knowledge/mentor-federation/public-qa-manifest.v1.json"||
   !/^[0-9a-f]{40}$/.test(cat.source?.gitBlobSha||"")||
   cat.totals?.publishedSources!==9||cat.totals?.publishedRecords!==1354||
   cat.policy?.noPrivateCore!==true||cat.policy?.noUnapprovedDrafts!==true||
   cat.policy?.noUserTranscriptUploads!==true||
   cat.policy?.requiresIndependentRuntimeAuthorization!==true||
   cat.policy?.sourceApprovalIsNotTruthVerification!==true||
   !Array.isArray(cat.members)||cat.members.length!==9)return null;
 let total=0;const map=new Map();
 for(const m of cat.members){
  if(!m||typeof m.mentorId!=="string"||map.has(m.mentorId)||
   !/^[a-z][a-z0-9-]{1,31}$/.test(m.mentorId)||
   typeof m.name!=="string"||!m.name||
   typeof m.sourceRepository!=="string"||
   !/^artist1970\/[A-Za-z0-9._-]+$/.test(m.sourceRepository)||
   typeof m.sourcePath!=="string"||
   !/^knowledge\/[A-Za-z0-9._/-]+\.json$/.test(m.sourcePath)||
   m.sourceUrl!=="https://artist1970.github.io/"+m.sourceRepository.split("/")[1]+"/"+m.sourcePath||
   !["approved","approved-public","approved-public-seed"].includes(m.approvedValue)||
   !["status","reviewStatus"].includes(m.statusField)||
   typeof m.sourceSchema!=="string"||!m.sourceSchema||
   !Number.isSafeInteger(m.recordCount)||m.recordCount<1)return null;
  map.set(m.mentorId,m);total+=m.recordCount;
 }
 return total===cat.totals.publishedRecords?map:null;
}
/**
 * Only accept the source statement for review by a designated requester.
 * The reviewEnabled flag is a test/lab feature gate, NOT authentication.
 * A genuine host must independently authenticate the caller later.
 * A minor cannot consume records until record-level youth suitability exists.
 */
export function acceptKnowledgeReference({
 discoveryIndex,governance,catalog,packet,requestMentorId,
 audience="unknown",reviewEnabled=false
}={}){
 if(reviewEnabled!==true)return blocked("review-lab-disabled");
 if(discoveryIndex?.status!=="aligned"||
   discoveryIndex.chancellor!=="noema"||
   discoveryIndex.administrator!=="naib"||
   governance?.schema!=="noema-naib-governance-discovery-v1"||
   governance.chancellor?.title!=="Chancellor of the AI mentors"||
   governance.administrator?.reportsTo!=="noema"||
   governance.policy?.independentServerAuthorizationRequired!==true)
  return blocked("governance-not-aligned");
 if(audience!=="adult")return blocked("youth-suitability-review-required");
 if(typeof requestMentorId!=="string"||
   !["naib",...discoveryIndex.entries.filter(x=>x.id!=="klasaipeer").map(x=>x.id)].includes(requestMentorId))
  return blocked("unapproved-requester");
 const sources=verifiedCatalog(catalog);
 if(!sources)return blocked("unapproved-source-snapshot");
 if(!ownsExact(packet)||packet.schema!==ACCEPTED_SCHEMA||packet.version!==1||
   packet.purpose!=="offline-review-only"||packet.requestMentorId!==requestMentorId||
   packet.classification!=="approved-public-reference"||
   packet.claimState!=="source-statement"||
   packet.matchMethod!=="exact-normalized-question"||
   packet.independentlyCorroborated!==false||
   packet.factVerified!==false||
   packet.humanReviewCompletedForUse!==false||
   packet.executionAuthority!==false||
   packet.liveModelConnected!==false||
   packet.persistentMemory!==false||
   packet.studentDataUsed!==false||
   packet.transcriptStored!==false||
   packet.canonPromotion!==false)return blocked("invalid-knowledge-packet");
 const owner=sources.get(packet.sourceMentorId);
 if(!owner||packet.sourceMentorId===requestMentorId||
   packet.sourceName!==owner.name||
   packet.sourceRepository!==owner.sourceRepository||
   packet.sourcePath!==owner.sourcePath||
   packet.sourceUrl!==owner.sourceUrl||
   ["hope","aurora"].includes(owner.mentorId))
  return blocked("source-or-specialist-review-required");
 if(typeof packet.recordId!=="string"||
   !/^[A-Za-z0-9_.:-]{1,120}$/.test(packet.recordId)||
   typeof packet.topic!=="string"||!packet.topic||packet.topic.length>120||
   typeof packet.answer!=="string"||packet.answer.length<12||
   packet.answer.length>2500||!CLEAN.test(packet.answer)||
   FORBIDDEN.test(packet.answer))
  return blocked("unsafe-reference-content");
 return Object.freeze({
  status:"reviewable-source-reference",
  reference:Object.freeze({
   kind:"credited-approved-public-knowledge",requestMentorId,
   sourceMentorId:owner.mentorId,sourceName:owner.name,
   sourceRepository:owner.sourceRepository,sourcePath:owner.sourcePath,
   sourceUrl:owner.sourceUrl,recordId:packet.recordId,
   topic:packet.topic,answer:packet.answer,
   claimState:"source-statement",factVerified:false,
   approvedPublicationNotIndependentTruth:true,readOnly:true,
   passedToLiveMentor:false,studentDataUsed:false
  }),
  executionAuthority:false,persistentMemory:false,canonPromotion:false
 });
}
