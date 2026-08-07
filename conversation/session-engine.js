import {normalizeConversationMessage} from "./message-schema.js";

function id() {
  return globalThis.crypto?.randomUUID
    ? `session_${globalThis.crypto.randomUUID()}`
    : `session_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}

export class SessionEngine {
  constructor({maxMessages=72}={}) {
    this.maxMessages=Math.max(12,Math.min(144,Number(maxMessages)||72));
    this.sessionId=id();
    this.messages=[];
    this.createdAt=new Date().toISOString();
  }

  add(message={}) {
    const normalized=normalizeConversationMessage(message);
    if (!normalized.content) return null;
    this.messages.push(normalized);
    if (this.messages.length>this.maxMessages) {
      this.messages=this.messages.slice(-this.maxMessages);
    }
    return normalized;
  }

  list(limit=this.maxMessages) {
    return this.messages.slice(-Math.max(1,Math.min(this.maxMessages,Number(limit)||this.maxMessages)))
      .map(item=>({...item}));
  }

  reset() {
    this.sessionId=id();
    this.messages=[];
    this.createdAt=new Date().toISOString();
  }

  status() {
    return {
      sessionId:this.sessionId,
      messageCount:this.messages.length,
      persisted:false,
      rawAudioStored:false
    };
  }
}
