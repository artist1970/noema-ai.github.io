import { normalizePersonProfile } from "./person-schema.js";
import { evaluateGuardianRequirement } from "./guardian-policy.js";

const KEY = "noema_enrollment_profile_v1";

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

function randomId(prefix) {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) return `${prefix}_${cryptoObj.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export class EnrollmentStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
  }

  load() {
    if (!this.storage) return null;
    try {
      const parsed = JSON.parse(this.storage.getItem(KEY) || "null");
      return parsed && parsed.schemaVersion === 1 ? parsed : null;
    } catch {
      return null;
    }
  }

  save(input = {}) {
    const existing = this.load();
    const profile = normalizePersonProfile({
      ...input,
      personId: existing?.personId || input.personId || randomId("person"),
      createdAt: existing?.createdAt || input.createdAt || new Date().toISOString()
    });

    if (!profile.displayName) {
      return { ok: false, reason: "A display name is required.", profile: null };
    }

    if (profile.ageBand === "unknown") {
      return { ok: false, reason: "Month and year are required to determine the enrollment pathway.", profile: null };
    }

    const guardian = evaluateGuardianRequirement(profile);

    const record = {
      ...profile,
      guardian,
      persistence: {
        mode: "local-staging",
        crossDevice: false,
        authMaterialStored: false
      }
    };

    if (this.storage) {
      try { this.storage.setItem(KEY, JSON.stringify(record)); } catch {}
    }

    return { ok: true, reason: "Local enrollment profile saved.", profile: record };
  }

  clear() {
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
  }
}
