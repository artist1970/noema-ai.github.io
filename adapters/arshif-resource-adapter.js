import {RESOURCE_EXECUTION_STATES} from "../resources/execution-state.js";

export class ArshifResourceAdapter {
  constructor({director}={}) {
    this.id="arshif-resources";
    this.name="ARSHIF Resource Discovery";
    this.version="1.0";
    this.capabilities=["resource-discovery","archive-navigation","preference-gating"];
    this.availability="manifest-discoverable";
    this.director=director;
  }

  canExecute(){return {ok:true,state:RESOURCE_EXECUTION_STATES.EXECUTED}}
  prepare(input={}){return {...input,sourceIds:["verve.arshif"]}}

  execute(input={}) {
    const results=this.director.discover({...input,sourceIds:["verve.arshif"]});
    return {
      state:RESOURCE_EXECUTION_STATES.EXECUTED,
      discoveryState:RESOURCE_EXECUTION_STATES.DISCOVERED,
      results
    };
  }
}
