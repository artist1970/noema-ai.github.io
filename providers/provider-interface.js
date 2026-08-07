export class NoemaProvider {
  constructor({
    id="unconnected",
    label="Unconnected provider",
    kind="placeholder",
    connected=false
  }={}) {
    this.id=id;
    this.label=label;
    this.kind=kind;
    this.connected=connected===true;
  }

  async respond() {
    throw new Error("No conversational model provider is connected.");
  }

  status() {
    return {
      id:this.id,
      label:this.label,
      kind:this.kind,
      connected:this.connected,
      generatedByModel:false
    };
  }
}
