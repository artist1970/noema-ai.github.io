import {getNaibIdentity} from "./naib-identity.js";

export class NaibFacade {
  constructor({noemaCore}={}) {
    if(!noemaCore) throw new Error("NAIB requires the NOEMA administrative core.");
    this.noema=noemaCore;
    this.identity=getNaibIdentity();
  }

  async respond(message,options={}) {
    const result=await this.noema.respond(message,options);

    return {
      ...result,
      publicIdentity:{
        name:this.identity.name,
        title:this.identity.title,
        role:this.identity.role
      },
      administrativeAuthority:{
        name:"NOEMA",
        constitutionActive:true,
        controls:[
          "permissions",
          "memory governance",
          "identity governance",
          "Verifier standards",
          "specialist authority",
          "security",
          "orchestration"
        ]
      }
    };
  }

  route(message,options={}) {
    return this.noema.route(message,options);
  }

  getCapabilities() {
    return this.noema.getCapabilities();
  }

  checkCapability(id,options={}) {
    return this.noema.checkCapability(id,options);
  }

  rememberExchange(input={}) {
    return this.noema.rememberExchange(input);
  }

  clearLocalData() {
    return this.noema.clearNoemaData();
  }

  getStatus() {
    return {
      identity:this.identity,
      administration:this.noema.getSystemStatus()
    };
  }
}
