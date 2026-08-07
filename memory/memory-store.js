import { normalizeMemoryInput } from "./memory-schema.js";
import { inspectMemoryForSecrets } from "./sensitive-memory-filter.js";

const KEY = "noema_memory_library_v1";
const MAX_ITEMS = 144;

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export class MemoryStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
    this.items = this.#load();
  }

  #load() {
    if (!this.storage) return [];
    try {
      const parsed = JSON.parse(this.storage.getItem(KEY) || "[]");
      return Array.isArray(parsed)
        ? parsed.filter(item => item && item.id && item.content).slice(-MAX_ITEMS)
        : [];
    } catch {
      return [];
    }
  }

  #save() {
    if (!this.storage) return;
    try {
      this.storage.setItem(KEY, JSON.stringify(this.items.slice(-MAX_ITEMS)));
    } catch {}
  }

  add(input = {}, { confirmed = false } = {}) {
    if (!confirmed) {
      return {
        ok: false,
        reason: "Explicit confirmation is required before creating long-term memory.",
        item: null
      };
    }

    const combined = `${input.title || ""}\n${input.content || ""}`;
    const inspection = inspectMemoryForSecrets(combined);
    if (!inspection.safeForOrdinaryMemory) {
      return {
        ok: false,
        reason: inspection.reason,
        matches: inspection.matches,
        item: null
      };
    }

    const item = normalizeMemoryInput(input);
    if (!item.content) {
      return { ok: false, reason: "Memory content is empty.", item: null };
    }

    this.items.push(item);
    this.items = this.items.slice(-MAX_ITEMS);
    this.#save();
    return { ok: true, reason: "Memory saved.", item: { ...item } };
  }

  update(id, patch = {}, { confirmed = false } = {}) {
    if (!confirmed) {
      return { ok: false, reason: "Explicit confirmation is required before editing memory." };
    }

    const index = this.items.findIndex(item => item.id === id);
    if (index < 0) return { ok: false, reason: "Memory not found." };

    const current = this.items[index];
    const combined = `${patch.title ?? current.title}\n${patch.content ?? current.content}`;
    const inspection = inspectMemoryForSecrets(combined);
    if (!inspection.safeForOrdinaryMemory) {
      return { ok: false, reason: inspection.reason, matches: inspection.matches };
    }

    const updated = normalizeMemoryInput({
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      source: patch.source || current.source
    });

    this.items[index] = updated;
    this.#save();
    return { ok: true, reason: "Memory updated.", item: { ...updated } };
  }

  remove(id, { confirmed = false } = {}) {
    if (!confirmed) {
      return { ok: false, reason: "Explicit confirmation is required before deleting memory." };
    }
    const before = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    this.#save();
    return {
      ok: this.items.length < before,
      reason: this.items.length < before ? "Memory deleted." : "Memory not found."
    };
  }

  list({ scope, kind, activeOnly = true } = {}) {
    return this.items
      .filter(item => !activeOnly || item.active !== false)
      .filter(item => !scope || item.scope === scope || item.scope === "global")
      .filter(item => !kind || item.kind === kind)
      .map(item => ({ ...item, source: { ...item.source }, tags: [...(item.tags || [])] }));
  }

  get(id) {
    const item = this.items.find(entry => entry.id === id);
    return item ? { ...item, source: { ...item.source }, tags: [...(item.tags || [])] } : null;
  }

  export() {
    return {
      format: "noema-memory-library",
      version: 1,
      exportedAt: new Date().toISOString(),
      memories: this.list({ activeOnly: false })
    };
  }

  reset({ confirmed = false } = {}) {
    if (!confirmed) {
      return { ok: false, reason: "Explicit confirmation is required before clearing the Memory Library." };
    }
    this.items = [];
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
    return { ok: true, reason: "Memory Library cleared." };
  }
}
