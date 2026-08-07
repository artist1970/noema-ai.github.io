export class NoemaProvider {
  constructor({ id = "unconnected" } = {}) {
    this.id = id;
    this.connected = false;
  }

  async respond() {
    throw new Error("No conversational model provider is connected.");
  }

  status() {
    return {
      id: this.id,
      connected: this.connected
    };
  }
}
