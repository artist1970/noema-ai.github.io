/**
 * Eiren Handoff Adapter
 * Noema (private Chancellor) -> NAIB (Administrator) -> Eiren
 * Contains no Eiren CORE personality or private material.
 */
export const EIREN_SPECIALIST = Object.freeze({
  id:"eiren", name:"Eiren", role:"Mentor",
  publicFront:"https://artist1970.github.io/Eiren.github.io/",
  domains:Object.freeze(["literature","reading","writing","storytelling","poetry","language","revision","editing","literacy","prose"])
});
const PATTERNS=Object.freeze({
  literature:/\b(literature|literary|novel|book|author|reading|read)\b/i,
  writing:/\b(write|writing|writer|draft|paragraph|essay|prose|sentence)\b/i,
  storytelling:/\b(story|storytelling|character|plot|scene|narrative|fiction)\b/i,
  poetry:/\b(poem|poetry|poetic|verse|stanza|rhyme)\b/i,
  language:/\b(language|english|grammar|word|vocabulary|spelling|phonics)\b/i,
  revision:/\b(revise|revision|edit|editing|proofread|rewrite|feedback)\b/i
});
export function detectEirenDomains(input=""){
  const text=String(input||"");
  return Object.entries(PATTERNS).filter(([,p])=>p.test(text)).map(([d])=>d);
}
export function createEirenHandoff({prompt="",context={},source="naib",requestedMode=null}={}){
  const domains=detectEirenDomains(prompt);
  return {
    status:"handoff-ready", administrator:"NAIB", specialist:"eiren",
    specialistName:"Eiren", specialistRole:"Mentor",
    publicFront:EIREN_SPECIALIST.publicFront, source,
    mode:requestedMode||(domains.includes("revision")?"revision":"guidance"),
    domains, request:{prompt:String(prompt||""),context:(context&&typeof context==="object")?context:{}},
    boundaries:{advisoryOnly:true,noAdministrativeAuthority:true,noPermissionElevation:true,
      noResourceOwnership:true,noImpersonation:true,noSilentLongTermMemory:true,
      noFalseRemoteExecutionClaims:true,preserveUserAuthorship:true,coreRemainsPrivate:true}
  };
}
export default {specialist:EIREN_SPECIALIST,detectDomains:detectEirenDomains,createHandoff:createEirenHandoff};
