const KEY = "noema_continuity_v1";
const MAX_ITEMS = 24;
const MAX_TEXT = 800;

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

function cleanText(value) {
  return String(value || "").trim().slice(0, MAX_TEXT);
}

export class ContinuityStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
    this.items = this.#load();
  }

  #load() {
    if (!this.storage) return [];
    try {
      const data = JSON.parse(this.storage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data.slice(-MAX_ITEMS) : [];
    } catch {
      return [];
    }
  }

  #save() {
    if (!this.storage) return;
    try { this.storage.setItem(KEY, JSON.stringify(this.items.slice(-MAX_ITEMS))); } catch {}
  }

  add({ user = "", assistant = "", mode = "" } = {}) {
    const item = {
      id: `cx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user: cleanText(user),
      assistant: cleanText(assistant),
      mode: cleanText(mode).slice(0, 40),
      createdAt: new Date().toISOString()
    };
    this.items.push(item);
    this.items = this.items.slice(-MAX_ITEMS);
    this.#save();
    return this.list();
  }

  list() {
    return this.items.map(item => ({ ...item }));
  }

  reset() {
    this.items = [];
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
  }
}
