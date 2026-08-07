import {RESOURCE_EXECUTION_STATES} from "../resources/execution-state.js";

export class LearningFederationAdapter {
  constructor({director}={}){
    this.id="learning-federation";
    this.name="Learning Resource Federation";
    this.version="1.0";
    this.capabilities=[
      "school-resource-discovery",
      "course-graph",
      "workshop-discovery",
      "educational-game-discovery",
      "archive-extension-discovery",
      "health-education-discovery"
    ];
    this.availability="local-integrated";
    this.director=director;
  }

  canExecute(){
    return {
      ok:Boolean(this.director),
      state:this.director
        ? RESOURCE_EXECUTION_STATES.EXECUTED
        : RESOURCE_EXECUTION_STATES.UNAVAILABLE
    };
  }

  prepare(input={}){
    return {...input};
  }

  execute(input={}){
    if(!this.director) {
      return {
        state:RESOURCE_EXECUTION_STATES.UNAVAILABLE,
        discoveryState:RESOURCE_EXECUTION_STATES.UNAVAILABLE,
        results:[]
      };
    }

    return {
      state:RESOURCE_EXECUTION_STATES.EXECUTED,
      discoveryState:RESOURCE_EXECUTION_STATES.DISCOVERED,
      results:this.director.discover(input)
    };
  }
}
