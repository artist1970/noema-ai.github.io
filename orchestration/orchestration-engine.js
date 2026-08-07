import {buildTaskPlan} from "./task-planner.js";
import {TaskGraph} from "./task-graph.js";
import {SpecialistExecutor} from "./specialist-executor.js";

export class OrchestrationEngine {
  constructor({core}={}) {
    this.core=core;
    this.executor=new SpecialistExecutor({core});
  }

  coordinate({
    message="",
    route={},
    researchDecision={required:false},
    verifierSession=null
  }={}) {
    const plan=buildTaskPlan({
      message,
      route,
      researchDecision,
      context:route.context || {}
    });

    const graph=new TaskGraph(plan.tasks);

    let guard=0;
    while(!graph.summary().complete && guard<64) {
      guard++;
      const ready=graph.list().filter(t=>t.status==="ready");
      if(!ready.length) break;

      for(const task of ready) {
        graph.start(task.id);
        const result=this.executor.execute(task,{
          message,
          route,
          context:route.context || {},
          verifierSession
        });
        graph.settle(task.id,{
          status:result.status,
          output:result.output
        });
      }
    }

    return {
      plan:{
        schemaVersion:plan.schemaVersion,
        goal:plan.goal,
        mode:plan.mode,
        project:plan.project
      },
      tasks:graph.list(),
      summary:graph.summary()
    };
  }
}
