const ROLES=new Set(["user","assistant","system","tool"]);

function id(prefix="msg") {
  return globalThis.crypto?.randomUUID
    ? `${prefix}_${globalThis.crypto.randomUUID()}`
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}

export function normalizeConversationMessage(input={}) {
  return {
    id:String(input.id || id()).slice(0,140),
    role:ROLES.has(input.role) ? input.role : "user",
    content:String(input.content || "").trim().slice(0,50000),
    createdAt:input.createdAt || new Date().toISOString(),
    provider:String(input.provider || "").slice(0,120),
    generatedByModel:input.generatedByModel === true
  };
}
