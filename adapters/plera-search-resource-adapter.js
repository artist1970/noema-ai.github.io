import {RESOURCE_EXECUTION_STATES} from "../resources/execution-state.js";

export class PleraSearchResourceAdapter {
  constructor({director}={}) {
    this.id="plera-search-resources";
    this.name="PLERA Search Resource Discovery";
    this.version="1.0";
    this.capabilities=["resource-discovery","research-navigation","freshness-aware-navigation"];
    this.availability="manifest-discoverable";
    this.director=director;
  }

  canExecute(){return {ok:true,state:RESOURCE_EXECUTION_STATES.EXECUTED}}
  prepare(input={}){return {...input,sourceIds:["verve.plera-search"]}}

  execute(input={}) {
    const results=this.director.discover({...input,sourceIds:["verve.plera-search"]});
    return {
      state:RESOURCE_EXECUTION_STATES.EXECUTED,
      discoveryState:RESOURCE_EXECUTION_STATES.DISCOVERED,
      results,
      warning:"PLERA Search resources are discovery/navigation tools. Dynamic content requires freshness checking and is not itself verified evidence."
    };
  }
}
