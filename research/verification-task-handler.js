const STATES=Object.freeze(["pending","ready","active","complete","blocked","skipped"]);

function id(prefix="task"){
  return globalThis.crypto?.randomUUID
    ? `${prefix}_${globalThis.crypto.randomUUID()}`
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}

export class VerificationTaskHandler {
  constructor(tasks=[]) {
    this.tasks=tasks.map(task=>this.#normalize(task));
    this.ledger=[];
  }

  #normalize(task={}) {
    return {
      id:String(task.id||id("verify")),
      label:String(task.label||"Verification step").slice(0,180),
      laneId:String(task.laneId||""),
      purpose:String(task.purpose||"").slice(0,600),
      status:STATES.includes(task.status)?task.status:"pending",
      requires:Array.isArray(task.requires)?[...new Set(task.requires.map(String))]:[],
      createdAt:task.createdAt||new Date().toISOString(),
      startedAt:task.startedAt||null,
      completedAt:task.completedAt||null,
      notes:Array.isArray(task.notes)?task.notes.slice(0,12):[]
    };
  }

  list(){return this.tasks.map(t=>({...t,requires:[...t.requires],notes:[...t.notes]}))}

  refresh() {
    const completed=new Set(this.tasks.filter(t=>t.status==="complete"||t.status==="skipped").map(t=>t.id));
    for(const task of this.tasks) {
      if(task.status==="pending" && task.requires.every(dep=>completed.has(dep))) task.status="ready";
    }
    return this.list();
  }

  start(taskId) {
    this.refresh();
    const task=this.tasks.find(t=>t.id===taskId);
    if(!task || !["ready","pending"].includes(task.status)) return {ok:false,reason:"Task is not ready."};
    if(task.requires.some(dep=>!this.tasks.some(t=>t.id===dep && ["complete","skipped"].includes(t.status))))
      return {ok:false,reason:"Task dependencies are incomplete."};
    task.status="active";task.startedAt=new Date().toISOString();
    this.#event(task,"started");
    return {ok:true,task:{...task}};
  }

  complete(taskId,note="") {
    const task=this.tasks.find(t=>t.id===taskId);
    if(!task) return {ok:false,reason:"Task not found."};
    task.status="complete";task.completedAt=new Date().toISOString();
    if(note)task.notes.push(String(note).slice(0,1000));
    this.#event(task,"completed",note);
    this.refresh();
    return {ok:true,task:{...task}};
  }

  block(taskId,note="") {
    const task=this.tasks.find(t=>t.id===taskId);
    if(!task)return{ok:false,reason:"Task not found."};
    task.status="blocked";
    if(note)task.notes.push(String(note).slice(0,1000));
    this.#event(task,"blocked",note);
    return{ok:true,task:{...task}};
  }

  #event(task,type,note="") {
    this.ledger.push({
      id:id("event"),taskId:task.id,laneId:task.laneId,type,
      at:new Date().toISOString(),note:String(note||"").slice(0,1000)
    });
  }

  summary() {
    const counts=Object.fromEntries(STATES.map(s=>[s,0]));
    for(const task of this.tasks)counts[task.status]=(counts[task.status]||0)+1;
    return {counts,total:this.tasks.length,complete:counts.complete===this.tasks.length};
  }
}
