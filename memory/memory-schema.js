export const MEMORY_KINDS = Object.freeze([
  "preference",
  "project",
  "goal",
  "decision",
  "reference",
  "continuity"
]);

export const MEMORY_SCOPES = Object.freeze([
  "personal",
  "family",
  "learning",
  "research",
  "creative",
  "work",
  "civic",
  "archive",
  "global"
]);

export function normalizeMemoryInput(input = {}) {
  const now = new Date().toISOString();
  const kind = MEMORY_KINDS.includes(input.kind) ? input.kind : "continuity";
  const scope = MEMORY_SCOPES.includes(input.scope) ? input.scope : "global";
  const content = String(input.content || "").trim().slice(0, 1600);
  const title = String(input.title || "").trim().slice(0, 120);
  const tags = Array.isArray(input.tags)
    ? [...new Set(input.tags.map(tag => String(tag || "").trim().toLowerCase()).filter(Boolean))].slice(0, 12)
    : [];

  return {
    id: String(input.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    version: 1,
    kind,
    scope,
    title,
    content,
    tags,
    source: {
      type: String(input.source?.type || "user-explicit"),
      label: String(input.source?.label || "Saved explicitly by user").slice(0, 120)
    },
    confidence:
      Number.isFinite(Number(input.confidence))
        ? Math.max(0, Math.min(1, Number(input.confidence)))
        : 1,
    createdAt: String(input.createdAt || now),
    updatedAt: now,
    expiresAt: input.expiresAt ? String(input.expiresAt) : null,
    active: input.active !== false
  };
}
