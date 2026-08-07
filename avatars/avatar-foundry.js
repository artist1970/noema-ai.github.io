import {AvatarStore} from "./avatar-store.js";
import {AvatarSupervisor} from "./avatar-supervisor.js";
import {normalizeAvatarManifest} from "./avatar-schema.js";
import {SketchStore} from "./sketch-store.js";
import {refineSketch} from "./sketch-refiner.js";
import {MoiraiRefinementAdapter} from "../adapters/moirai-refinement-adapter.js";
import {getTemperament} from "./personality-catalog.js";

export class AvatarFoundry{
  constructor({storage,relationshipStore,enrollmentStore}={}){
    this.store=new AvatarStore(storage);
    this.sketches=new SketchStore(storage);
    this.supervisor=new AvatarSupervisor();
    this.relationships=relationshipStore;
    this.enrollment=enrollmentStore;
    this.moirai=new MoiraiRefinementAdapter();
  }
  current(){return this.store.load()}
  currentSketch(){return this.sketches.load()}
  draft(input={}){
    const relation=this.relationships?.load?.();
    if(!relation?.mentorId)return{ok:false,reason:"Create an enrollment profile before designing a mentor.",avatar:null};
    const sketch=this.currentSketch();
    return normalizeAvatarManifest({
      ...input,mentorId:relation.mentorId,status:"draft",
      artSource:{...(input.artSource||{}),sketchId:input.creationMode==="sketch"?sketch?.sketchId||null:null}
    });
  }
  saveSketch(strokes=[],meta={}){
    const refined=refineSketch(strokes,meta.refinement||{});
    return this.sketches.save({
      originalStrokes:strokes,refinedStrokes:refined,
      width:meta.width||600,height:meta.height||520,
      guide:meta.guide||"face",symmetry:meta.symmetry===true
    },{confirmed:true});
  }
  saveDraft(input={}){
    const manifest=this.draft(input);if(!manifest?.mentorId)return manifest;
    const review=this.supervisor.inspect(manifest,this.enrollment?.load?.());
    if(!review.ok)return{ok:false,reason:review.concerns.join(" "),avatar:null,review};
    return{...this.store.save(manifest,{confirmed:true}),review};
  }
  adopt(input={}){
    const manifest=this.draft(input);if(!manifest?.mentorId)return manifest;
    if(manifest.creationMode==="sketch"&&!this.currentSketch())
      return{ok:false,reason:"Save the mentor drawing before adopting this sketch-based mentor.",avatar:null};
    const review=this.supervisor.inspect(manifest,this.enrollment?.load?.());
    if(!review.ok)return{ok:false,reason:review.concerns.join(" "),avatar:null,review};
    return{...this.store.adopt(manifest,{confirmed:true}),review};
  }
  greeting(manifest=this.current()){
    if(!manifest)return"Hello. I’m your learning companion.";
    const t=getTemperament(manifest.temperament);
    const interest=manifest.sharedInterests?.[0];
    return `Hi! I’m ${manifest.displayName}. ${t.childLine}${interest?` I’m especially excited that we can explore ${interest} together.`:""}`;
  }
  createMoiraiEnvelope(){return this.moirai.createEnvelope({sketch:this.currentSketch(),avatar:this.current()})}
  clear(){this.store.clear();this.sketches.clear()}
}
