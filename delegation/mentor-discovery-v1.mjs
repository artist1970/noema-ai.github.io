/**
 * NOEMA Chancellor → NAIB Administrator → specialist public discovery.
 * Source-only. Never loads a mentor model, student record or STOS service.
 * A registered identity is NOT an active, authenticated mentor adapter.
 */
import {specialistEligible} from "../specialists/specialist-registry.js";
export const DISCOVERY_SCHEMA="noema-naib-mentor-discovery-v1";
const HANDOFFS=Object.freeze({eiren:"../adapters/eiren-adapter.js",moirai:"../adapters/moirai-adapter.js"});
const PHRASES=Object.freeze({
 archaemenes:["algebra","geometry","mathematics","science lesson","school lesson","academic curriculum"],
 eiren:["poetry","poem","literature","novel","essay","short story","storytelling","creative writing"],
 moirai:["music","musical","melody","rhythm","chord","song","songwriting","lyrics","music theory"],
 zelle:["painting","drawing","sketch","visual art","illustration","sculpture","color palette"],
 pierre:["french","spanish","german","mandarin","arabic language","foreign language","linguistics","pronunciation","translation"],
 arshif:["archive","archives","archival record","primary sources","bibliography","historical sources","library research"],
 auren:["provenance","version history","document lineage","chain of custody","source lineage"],
 aurora:["mindfulness","meditation","breathing exercise","grounding","gentle yoga","relaxation"],
 mavric:["computer hardware","computer repair","device troubleshooting","technical diagnostics"],
 codalis:["programming","javascript code","python code","coding exercise","debug my code"],
 araneae:["security audit","privacy audit","defensive security","threat modeling"]
});
const AUDIENCES=new Set(["child","student","adult"]);
const RESTRICTED=new Set(["noema","naib","klasaipeer"]);
const IDENTIFIER=/^[a-z][a-z0-9-]{1,31}$/;
const SENSITIVE=/\b(password|passcode|secret|private[\s-]?key|api[\s-]?key|bearer[\s-]?token|access[\s-]?token|medical[\s-]?record|student[\s-]?record|learner[\s-]?record|account[\s-]?credential)\b/i;
const BOUNDARY=Object.freeze({authority:"public-discovery-reference-only",executed:false,liveModelConnected:false,studentDataUsed:false,transcriptStored:false,persistentMemory:false,hturtVerified:false,canonPromotion:false});
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function safeUrl(x){
 try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password&&!u.hash&&
  ["artist1970.github.io","vervenveda.com"].includes(u.hostname);}
 catch{return false;}
}
function refuse(reason){return Object.freeze({status:"withheld",reason,candidates:Object.freeze([]),...BOUNDARY});}
function hasPhrase(text,phrase){
 const expression=phrase.split(" ").join("\\s+");
 return new RegExp("(^|[^a-z0-9])"+expression+"(?=$|[^a-z0-9])","i").test(text);
}
/**
 * Caller injects separately reviewed snapshots. The blob SHA is provenance
 * metadata, not cryptographic authentication of a live external registry.
 */
export function buildMentorDiscoveryIndex({registry,publicRoster,governance}={}){
 if(!isObject(registry)||registry.schema!=="naib-mentor-registry"||
   registry.version!==3||registry.administrator?.id!=="naib"||
   registry.governance?.chancellor!=="NOEMA"||
   registry.policy?.registryIsNotActivationAuthority!==true||
   registry.policy?.adapterRequiredForDelegatedHandoff!==true||
   !Array.isArray(registry.mentors)||
   !isObject(governance)||governance.schema!=="noema-naib-governance-discovery-v1"||
   governance.version!==1||governance.chancellor?.id!=="noema"||
   governance.administrator?.id!=="naib"||
   governance.administrator?.reportsTo!=="noema"||
   governance.chancellor?.routableSpecialist!==false||
   governance.administrator?.routableSpecialist!==false||
   governance.policy?.independentServerAuthorizationRequired!==true||
   !isObject(publicRoster)||publicRoster.schema!=="vnv-public-mentor-roster-alignment-v1"||
   publicRoster.version!==1||publicRoster.scope!=="public-discovery-reference-only"||
   !/^[a-f0-9]{40}$/.test(publicRoster.source?.blobSha||"")||
   !Array.isArray(publicRoster.mentors))return refuse("invalid-governance-or-registry");
 const official=new Map(),publicIds=new Map();
 for(const m of registry.mentors){
  if(!isObject(m)||!IDENTIFIER.test(m.id)||typeof m.name!=="string"||
    !safeUrl(m.publicFront)||official.has(m.id)||RESTRICTED.has(m.id)&&m.id!=="klasaipeer")
    return refuse("invalid-registered-identity");
  official.set(m.id,m);
 }
 for(const m of publicRoster.mentors){
  if(!isObject(m)||!IDENTIFIER.test(m.id)||!safeUrl(m.url)||
     m.trust!=="public-discovery-only"||publicIds.has(m.id))return refuse("invalid-public-identity");
  publicIds.set(m.id,m);
 }
 if(official.size!==publicIds.size||official.size<2)return refuse("registry-roster-drift");
 for(const [id,m] of official)
  if(publicIds.get(id)?.url!==m.publicFront)return refuse("registry-roster-drift");
 return Object.freeze({schema:DISCOVERY_SCHEMA,status:"aligned",
  chancellor:"noema",administrator:"naib",
  sourceBlobSha:publicRoster.source.blobSha,
  entries:Object.freeze([...official.values()].map(m=>Object.freeze({
   id:m.id,name:m.name,url:m.publicFront,status:m.status,adapter:m.adapter
  }))),...BOUNDARY});
}
function makeCandidate(m,audience,explicitRequest){
 const check=specialistEligible(m.id,{audience,explicitRequest,accountConnected:false});
 // A named public mentor absent from the old specialist-executor registry
 // can still be discovered, but never considered an executable adapter.
 const eligible=check.eligible ||
  (check.reason==="unknown-specialist"&&AUDIENCES.has(audience)&&m.id!=="hope"&&m.id!=="klasaipeer");
 const handoff=eligible&&own(HANDOFFS,m.id)&&m.adapter===HANDOFFS[m.id]&&
   (m.id==="eiren"&&m.status==="handoff-ready"||
    m.id==="moirai"&&m.status==="existing-reference-implementation");
 return Object.freeze({id:m.id,name:m.name,publicUrl:m.url,
  kind:handoff?"verified-handoff-reference":"public-discovery-reference",
  handoffEligible:handoff,liveModelConnected:false,executed:false});
}
/**
 * This is a suggestion, NOT a handoff. No source prompt or personal context
 * is returned. Unknown age, admin identities and restricted adoption withhold.
 */
export function suggestMentorRoute(index,{prompt="",audience="unknown",selectedMentorId=null,explicitRequest=false}={}){
 if(index?.status!=="aligned"||index.schema!==DISCOVERY_SCHEMA||
    index.chancellor!=="noema"||index.administrator!=="naib")return refuse("unverified-registry");
 if(!AUDIENCES.has(audience))return refuse("unverified-audience");
 if(typeof prompt!=="string"||prompt.length>400||SENSITIVE.test(prompt))
   return refuse("unsafe-or-oversized-request");
 if(selectedMentorId!==null&&(!IDENTIFIER.test(selectedMentorId)||RESTRICTED.has(selectedMentorId)))
   return refuse("protected-identity-not-specialist");
 const lookup=new Map(index.entries.map(e=>[e.id,e]));
 if(selectedMentorId&&!lookup.has(selectedMentorId))return refuse("unregistered-identity");
 const selected=selectedMentorId?[selectedMentorId]:
    Object.entries(PHRASES)
      .filter(([id,words])=>lookup.has(id)&&words.some(w=>hasPhrase(prompt.normalize("NFKC"),w)))
      .map(([id])=>id);
 if(selected.length===0)return Object.freeze({status:"unmatched",candidates:Object.freeze([]),...BOUNDARY});
 const candidates=selected.map(id=>({
  id,eligible:specialistEligible(id,{audience,
   explicitRequest:selectedMentorId==="hope"&&explicitRequest===true,accountConnected:false})
 })).filter(x=>x.eligible.eligible||
    x.eligible.reason==="unknown-specialist"&&x.id!=="hope"&&x.id!=="klasaipeer");
 if(!candidates.length)return refuse("audience-or-guardian-gate");
 const refs=Object.freeze(candidates.map(x=>makeCandidate(lookup.get(x.id),audience,
  selectedMentorId==="hope"&&explicitRequest===true)));
 return Object.freeze({status:refs.length>1?"choice-required":
   refs[0].handoffEligible?"handoff-proposal":"discovery-proposal",
  requiresUserChoice:true,candidates:refs,...BOUNDARY});
}
