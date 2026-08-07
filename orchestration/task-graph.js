export const TASK_STATES = Object.freeze([
  "pending","ready","active","complete","handoff","unavailable","blocked","skipped"
]);

function copyTask(task={}) {
  return {
    id:String(task.id || ""),
    label:String(task.label || "").slice(0,180),
    purpose:String(task.purpose || "").slice(0,600),
    specialistId:String(task.specialistId || "noema"),
    requires:[...(task.requires || [])].map(String),
    status:TASK_STATES.includes(task.status) ? task.status : "pending",
    output:task.output || null,
    note:String(task.note || "").slice(0,1200)
  };
}

export class TaskGraph {
  constructor(tasks=[]) {
    this.tasks=tasks.map(copyTask);
    this.refresh();
  }

  refresh() {
    const settled=new Set(
      this.tasks.filter(t=>["complete","handoff","unavailable","skipped"].includes(t.status))
        .map(t=>t.id)
    );
    for(const task of this.tasks) {
      if(task.status==="pending" && task.requires.every(id=>settled.has(id))) {
        task.status="ready";
      }
    }
    return this.list();
  }

  get(id){return this.tasks.find(t=>t.id===id) || null}
  list(){return this.tasks.map(copyTask)}

  start(id) {
    this.refresh();
    const task=this.get(id);
    if(!task || task.status!=="ready") return {ok:false,reason:"Task is not ready."};
    task.status="active";
    return {ok:true,task:copyTask(task)};
  }

  settle(id,{status="complete",output=null,note=""}={}) {
    const task=this.get(id);
    if(!task) return {ok:false,reason:"Task not found."};
    if(!["complete","handoff","unavailable","blocked","skipped"].includes(status))
      return {ok:false,reason:"Invalid settlement state."};
    task.status=status;
    task.output=output;
    task.note=String(note || "").slice(0,1200);
    this.refresh();
    return {ok:true,task:copyTask(task)};
  }

  summary() {
    const counts=Object.fromEntries(TASK_STATES.map(s=>[s,0]));
    for(const task of this.tasks) counts[task.status]=(counts[task.status]||0)+1;
    const finished=this.tasks.filter(t=>["complete","handoff","unavailable","blocked","skipped"].includes(t.status)).length;
    return {
      total:this.tasks.length,
      finished,
      complete:finished===this.tasks.length,
      counts
    };
  }
}
