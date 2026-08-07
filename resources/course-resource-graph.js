function clean(value,max=300){return String(value || "").trim().slice(0,max)}

function requestedGranularity(query="") {
  const q=String(query || "");
  if(/\bunit\s*\d+/i.test(q)) return "unit";
  if(/\bweek\s*\d+/i.test(q)) return "week";
  if(/\blesson\s*\d*/i.test(q)) return "lesson";
  if(/\bquiz|test|assessment\b/i.test(q)) return "quiz";
  if(/\bworkshop\b/i.test(q)) return "workshop";
  if(/\bgame\b/i.test(q)) return "game";
  if(/\bcourse|class|curriculum\b/i.test(q)) return "course";
  return "";
}

export class CourseResourceGraph {
  constructor(){
    this.nodes=new Map();
    this.edges=[];
  }

  rebuild(sourceRecords=[]) {
    this.nodes.clear();
    this.edges=[];

    for(const {source,manifest} of sourceRecords) {
      const sourceNode=`source:${source.id}`;
      this.nodes.set(sourceNode,{
        id:sourceNode,
        kind:"source",
        sourceId:source.id,
        title:manifest.name || source.label,
        tier:source.tier
      });

      for(const resource of manifest.resources || []) {
        const resourceNode=`resource:${source.id}:${resource.id}`;
        this.nodes.set(resourceNode,{
          id:resourceNode,
          kind:"resource",
          sourceId:source.id,
          resourceId:resource.id,
          title:resource.title,
          resourceType:resource.resourceType,
          subjects:[...(resource.subjects || [])],
          learningObjectives:[...(resource.learningObjectives || [])],
          url:resource.url
        });
        this.edges.push({from:sourceNode,to:resourceNode,type:"contains"});
      }
    }
    return this.status();
  }

  status(){
    return {
      nodes:this.nodes.size,
      edges:this.edges.length,
      inventedNodes:0
    };
  }

  coverageForQuery(query="",results=[]) {
    const requested=requestedGranularity(query);
    if(!requested) return {
      requestedGranularity:"",
      indexed:true,
      gap:""
    };

    const matching=results.some(r=>r.resourceType===requested);
    if(matching) return {
      requestedGranularity:requested,
      indexed:true,
      gap:""
    };

    return {
      requestedGranularity:requested,
      indexed:false,
      gap:`The federation does not currently index a ${requested}-level resource matching this request. A broader school/course resource may still be available.`
    };
  }

  serialize(maxNodes=80){
    return {
      ...this.status(),
      nodes:[...this.nodes.values()].slice(0,maxNodes),
      edges:this.edges.slice(0,maxNodes*2)
    };
  }
}
