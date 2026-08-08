import {LearningFederation} from "./learning-federation.js";
import {NAIBInternalCloud} from "../storage/internal-cloud-instance.js";

export class ResourceDirector extends LearningFederation {
  constructor(options={}){
    super(options);
    this.cloud=options.cloud || NAIBInternalCloud;
    this.cloudReady=this.cloud.initialize().catch(error=>({
      ok:false,
      error:String(error?.message || error)
    }));
  }

  async cacheFederationInventory(reason="refresh"){
    await this.cloudReady;
    const cachedAt=new Date().toISOString();
    const saved=[];

    for(const [sourceId,loader] of this.loaders.entries()){
      const current=loader.get();
      const result=await this.cloud.put(
        "federation-cache",
        `source/${sourceId}`,
        {
          sourceId,
          cachedAt,
          reason,
          manifest:current.manifest,
          provenance:current.provenance
        },
        {
          metadata:{
            sourceId,
            reason,
            resourceCount:current.manifest?.resources?.length || 0,
            provenance:current.provenance?.mode || "unknown"
          }
        }
      );
      saved.push(result.record);
    }

    await this.cloud.put(
      "federation-cache",
      "index/latest",
      {
        cachedAt,
        reason,
        graph:this.graph.status(),
        sources:this.sourceStatus()
      },
      {metadata:{kind:"federation-index",sourceCount:saved.length,reason}}
    );

    return {ok:true,cachedAt,count:saved.length};
  }

  async refresh(options={}){
    const result=await super.refresh(options);
    try{await this.cacheFederationInventory("refresh")}catch{}
    return result;
  }

  async storageStatus(){
    await this.cloudReady;
    return this.cloud.status();
  }

  async cachedFederationIndex(){
    await this.cloudReady;
    return this.cloud.get("federation-cache","index/latest");
  }
}
