export class MoiraiRefinementAdapter{
  constructor({enabled=false,endpoint=""}={}){
    this.enabled=enabled===true;
    this.endpoint=String(endpoint||"");
  }

  status(){
    return {
      id:"moirai-avatar-refinement",
      enabled:this.enabled,
      connected:false,
      mode:this.enabled?"configured-not-connected":"future-seam",
      purpose:"Polish a user-drawn mentor into a character while preserving the source drawing."
    };
  }

  createEnvelope({sketch,avatar}={}){
    if(!sketch) return {ok:false,reason:"A source drawing is required."};
    return {
      ok:true,
      envelope:{
        protocol:"noema-moirai-avatar-refinement-v1",
        operation:"refine-user-drawn-character",
        sourceProvenance:"user-drawn",
        preserveSourceIdentity:true,
        prohibitUnrelatedReplacement:true,
        originalSketchId:sketch.sketchId,
        originalStrokes:sketch.originalStrokes,
        cleanedStrokes:sketch.refinedStrokes,
        characterIntent:{
          displayName:avatar?.displayName||"",
          temperament:avatar?.temperament||"curious",
          appearancePalette:avatar?.appearance||{}
        },
        requestedOutput:{
          type:"polished-character",
          style:"friendly-illustrated-mentor",
          preserveRecognizableSketchFeatures:true,
          allowLineCleanup:true,
          allowProportionBalancing:true,
          allowColorCleanup:true
        }
      }
    };
  }

  async refine(){
    return {
      ok:false,
      reason:"Moirai refinement is not connected in this static release. The preserved sketch and refinement envelope are ready for a future approved image service."
    };
  }
}
