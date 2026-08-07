const KEY = "noema_mentor_relationship_v1";

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

function randomId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export class MentorRelationshipStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
  }

  load() {
    if (!this.storage) return null;
    try {
      const parsed = JSON.parse(this.storage.getItem(KEY) || "null");
      return parsed?.schemaVersion === 1 ? parsed : null;
    } catch {
      return null;
    }
  }

  ensure({ personId, mentorId } = {}) {
    if (!personId) return null;
    const existing = this.load();
    if (existing?.personId === personId) return existing;

    const relationship = {
      schemaVersion: 1,
      relationshipId: randomId("relationship"),
      personId,
      mentorId: mentorId || randomId("mentor"),
      relationshipType: "adopted-mentor",
      supervisor: "noema",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persistence: "local-prototype"
    };

    if (this.storage) {
      try { this.storage.setItem(KEY, JSON.stringify(relationship)); } catch {}
    }
    return relationship;
  }

  clear() {
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
  }
}
