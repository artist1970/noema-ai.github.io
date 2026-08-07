export function buildSpecialistContext(orchestration={}) {
  return (orchestration.tasks || []).flatMap(task=>{
    if(!task.output) return [];
    const base={
      taskId:task.id,
      label:task.label,
      specialistId:task.specialistId,
      status:task.status
    };

    if(task.status==="handoff") {
      return [{
        ...base,
        executed:false,
        handoff:{
          url:String(task.output.url || "").slice(0,1600),
          brief:task.output.brief || null
        }
      }];
    }

    if(task.status==="complete") {
      return [{
        ...base,
        executed:true,
        result:task.output
      }];
    }

    return [{
      ...base,
      executed:false,
      result:task.output
    }];
  }).slice(0,12);
}
