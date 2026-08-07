import {normalizeAvatarManifest} from "./avatar-schema.js";
const KEY="noema_avatar_manifest_v1";
function resolveStorage(storage){if(storage)return storage;try{return globalThis.localStorage||null}catch{return null}}
export class AvatarStore{
  constructor(storage){this.storage=resolveStorage(storage)}
  load(){if(!this.storage)return null;try{const p=JSON.parse(this.storage.getItem(KEY)||"null");return p?.schemaVersion===1?p:null}catch{return null}}
  save(input={}, {confirmed=false}={}){
    if(!confirmed)return{ok:false,reason:"Saving a mentor requires explicit user action.",avatar:null};
    const avatar=normalizeAvatarManifest(input);
    if(!avatar.mentorId)return{ok:false,reason:"Create an enrollment profile before saving a mentor.",avatar:null};
    try{this.storage?.setItem(KEY,JSON.stringify(avatar))}catch{}
    return{ok:true,reason:"Mentor design saved locally.",avatar};
  }
  adopt(input={}, {confirmed=false}={}){
    if(!confirmed)return{ok:false,reason:"Adoption requires explicit confirmation.",avatar:null};
    const avatar=normalizeAvatarManifest({...input,status:"adopted",adoption:{...(input.adoption||{}),adoptedAt:input.adoption?.adoptedAt||new Date().toISOString()}});
    if(!avatar.mentorId)return{ok:false,reason:"Create an enrollment profile before adoption.",avatar:null};
    try{this.storage?.setItem(KEY,JSON.stringify(avatar))}catch{}
    return{ok:true,reason:`${avatar.displayName} is now your adopted learning companion.`,avatar};
  }
  clear(){try{this.storage?.removeItem(KEY)}catch{}}
}
