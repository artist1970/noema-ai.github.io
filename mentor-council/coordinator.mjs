/** Mentor Council Coordinator v1 — isolated, injected adapters; no network, storage or admin side effects.
 * This is a real multi-mentor *orchestration primitive*, NOT a model backend.
 * A callable mentor must be registered with an authenticated adapter before receiving turns.
 */
const MEMBERS=new Set(["auren","eiren","hope","pierre","arshif","zelle","moirai","archaemenes","aurora","naib"]);
const FORBIDDEN=/\b(password|passcode|token|secret|api.?key|private.?key|credential|bearer|session.?cookie)\b/i;
const clean=(s,max)=>String(s??"").trim().slice(0,max);
export const COUNCIL_SCHEMA="vnv-mentor-council-v1";
export class MentorCouncil {
 constructor({authorize,adapters={},maxTurns=24,timeoutMs=12000}={}){
  if(typeof authorize!=="function")throw Error("authorization callback required");
  this.authorize=authorize;
  this.adapters=new Map();
  for(const [id,adapter] of Object.entries(adapters))this.register(id,adapter);
  this.sessions=new Map();
  this.maxTurns=Math.min(50,Math.max(2,Number(maxTurns)||24));
  this.timeoutMs=Math.min(30000,Math.max(1000,Number(timeoutMs)||12000));
 }
 register(id,adapter){
  if(!MEMBERS.has(id)||typeof adapter!=="function")throw Error("unapproved mentor adapter");
  this.adapters.set(id,adapter);
 }
 async begin({principal,invited,sessionId}){
  if(!(await this.authorize({principal,operation:"council.begin"})))throw Error("not authorized");
  if(!Array.isArray(invited)||invited.length===0||invited.length>10||invited.some(id=>!MEMBERS.has(id)))throw Error("invalid mentor selection");
  const id=clean(sessionId,96);if(!/^[A-Za-z0-9_-]{8,96}$/.test(id)||this.sessions.has(id))throw Error("invalid or duplicate session");
  const ids=[...new Set(invited)];
  const room={id,principal,invited:ids,turns:[],createdAt:new Date().toISOString()};
  this.sessions.set(id,room);
  return {schema:COUNCIL_SCHEMA,sessionId:id,invited:ids,adaptersReady:ids.filter(m=>this.adapters.has(m)),missingAdapters:ids.filter(m=>!this.adapters.has(m))};
 }
 async ask({principal,sessionId,message}){
  const room=this.sessions.get(sessionId);
  if(!room||room.principal!==principal||!(await this.authorize({principal,operation:"council.ask",sessionId})))throw Error("not authorized");
  const prompt=clean(message,2000);
  if(!prompt||String(message).length>2000||FORBIDDEN.test(prompt))throw Error("invalid or potentially secret-bearing input");
  if(room.turns.length>=this.maxTurns)throw Error("session turn limit reached");
  const prior=room.turns.slice(-8).map(t=>({role:t.role,speaker:t.speaker,content:t.content}));
  const turn={role:"user",speaker:"owner",content:prompt};
  room.turns.push(turn);
  const replies=[];
  for(const mentorId of room.invited){
   const adapter=this.adapters.get(mentorId);
   if(!adapter){replies.push({mentorId,status:"adapter-unavailable",content:null});continue;}
   try{
    // The adapter receives a copy; it is responsible for its own source/privilege scope.
    const result=await Promise.race([
      Promise.resolve().then(()=>adapter({schema:COUNCIL_SCHEMA,mentorId,principal,sessionId,prompt,prior:structuredClone(prior),authority:"proposal-only",readOnly:true})),
      new Promise((_,reject)=>setTimeout(()=>reject(Error("timeout")),this.timeoutMs))
    ]);
    if(!result||result.status!=="ok"||typeof result.content!=="string"||result.content.length>6000||!Array.isArray(result.sources)||!["live-mentor","approved-public-reference"].includes(result.kind))throw Error("invalid adapter response");
    const entry={mentorId,status:"ok",kind:result.kind,content:result.content,sources:result.sources.filter(s=>typeof s==="string").slice(0,12),runtimeId:clean(result.runtimeId,100)||null};
    replies.push(entry);room.turns.push({role:"assistant",speaker:mentorId,content:entry.content});
   }catch{replies.push({mentorId,status:"adapter-error",content:null});}
  }
  return {schema:COUNCIL_SCHEMA,sessionId,authority:"proposal-only",replies,retained:"in-process-only",dispatched:replies.some(x=>x.status==="ok")};
 }
 async end({principal,sessionId}){
  const room=this.sessions.get(sessionId);if(!room||room.principal!==principal||!(await this.authorize({principal,operation:"council.end",sessionId})))throw Error("not authorized");
  this.sessions.delete(sessionId);return {closed:true,sessionId};
 }
}
