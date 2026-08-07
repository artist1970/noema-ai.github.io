import {RESOURCE_EXECUTION_STATES} from "../resources/execution-state.js";

export class KhaemenesResourceAdapter {
  constructor({director}={}) {
    this.id="khaemenes-resources";
    this.name="Khaemenes Academy Resources";
    this.version="1.0";
    this.capabilities=["resource-discovery","education-navigation"];
    this.availability="manifest-discoverable";
    this.director=director;
  }

  canExecute(){return {ok:true,state:RESOURCE_EXECUTION_STATES.EXECUTED}}
  prepare(input={}){return {...input,sourceIds:["khaemenes.academy"]}}

  execute(input={}) {
    const results=this.director.discover({...input,sourceIds:["khaemenes.academy"]});
    return {
      state:RESOURCE_EXECUTION_STATES.EXECUTED,
      discoveryState:RESOURCE_EXECUTION_STATES.DISCOVERED,
      results
    };
  }
}
