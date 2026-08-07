const KEY="noema_verifier_sessions_v1";
const MAX=27;
function storageOf(storage){if(storage)return storage;try{return globalThis.localStorage||null}catch{return null}}
function id(){return globalThis.crypto?.randomUUID?`verify_${globalThis.crypto.randomUUID()}`:`verify_${Date.now()}_${Math.random().toString(36).slice(2,9)}`}
export class VerifierSessionStore{
  constructor(storage){this.storage=storageOf(storage)}
  list(){try{const x=JSON.parse(this.storage?.getItem(KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
  save(session,{confirmed=false}={}){
    if(!confirmed)return{ok:false,reason:"Saving a verification session requires explicit user action."};
    const items=this.list();
    const record={...session,id:session.id||id(),updatedAt:new Date().toISOString()};
    const index=items.findIndex(x=>x.id===record.id);
    if(index>=0)items[index]=record;else items.unshift(record);
    try{this.storage?.setItem(KEY,JSON.stringify(items.slice(0,MAX)))}catch{}
    return{ok:true,session:record};
  }
  remove(sessionId,{confirmed=false}={}){
    if(!confirmed)return{ok:false,reason:"Deleting a verification session requires explicit confirmation."};
    try{this.storage?.setItem(KEY,JSON.stringify(this.list().filter(x=>x.id!==sessionId)))}catch{}
    return{ok:true};
  }
  clear(){try{this.storage?.removeItem(KEY)}catch{}}
}
