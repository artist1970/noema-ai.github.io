const KEY = "noema_preferences_v1";

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export class PreferenceStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
  }

  load() {
    if (!this.storage) return { version: 1, preferences: {}, updatedAt: null };
    try {
      const parsed = JSON.parse(this.storage.getItem(KEY) || "null");
      return parsed?.version === 1
        ? parsed
        : { version: 1, preferences: {}, updatedAt: null };
    } catch {
      return { version: 1, preferences: {}, updatedAt: null };
    }
  }

  save(preferences = {}) {
    const state = {
      version: 1,
      preferences: { ...preferences },
      updatedAt: new Date().toISOString()
    };
    if (this.storage) {
      try { this.storage.setItem(KEY, JSON.stringify(state)); } catch {}
    }
    return state;
  }

  patch(patch = {}) {
    return this.save({
      ...this.load().preferences,
      ...patch
    });
  }

  reset() {
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
  }
}
