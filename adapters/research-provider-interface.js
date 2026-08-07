export class ResearchProviderInterface {
  constructor({id="unconfigured-research-provider",connected=false}={}) {
    this.id=id;
    this.connected=connected===true;
  }
  status(){
    return {
      id:this.id,
      connected:this.connected,
      liveSearch:false,
      note:"NOEMA v0.8 contains the verification policy and workflow. A secure provider/server must supply live retrieval."
    };
  }
  async search(){
    throw new Error("Live research retrieval is not configured in this static release.");
  }
}
