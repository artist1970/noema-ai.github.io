const KEY="noema_avatar_sketch_v1";
function resolveStorage(storage){
  if(storage) return storage;
  try{return globalThis.localStorage||null}catch{return null}
}
function randomId(){
  return globalThis.crypto?.randomUUID
    ? `sketch_${globalThis.crypto.randomUUID()}`
    : `sketch_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}
export class SketchStore{
  constructor(storage){this.storage=resolveStorage(storage)}
  load(){
    if(!this.storage) return null;
    try{
      const parsed=JSON.parse(this.storage.getItem(KEY)||"null");
      return parsed?.schemaVersion===1?parsed:null;
    }catch{return null}
  }
  save({
    originalStrokes=[],
    refinedStrokes=[],
    width=600,
    height=520,
    guide="face",
    symmetry=false
  }={}, {confirmed=false}={}){
    if(!confirmed) return {ok:false,reason:"Saving a mentor drawing requires explicit user action."};
    const existing=this.load();
    const record={
      schemaVersion:1,
      sketchId:existing?.sketchId||randomId(),
      source:"user-drawn",
      artLineage:"bazaar-art-inspired",
      width,height,guide,symmetry,
      originalStrokes,
      refinedStrokes,
      hasRefinedVersion:refinedStrokes.length>0,
      originalPreserved:true,
      updatedAt:new Date().toISOString()
    };
    try{this.storage?.setItem(KEY,JSON.stringify(record))}catch{}
    return {ok:true,reason:"Original drawing and cleaned version saved locally.",sketch:record};
  }
  clear(){try{this.storage?.removeItem(KEY)}catch{}}
}
