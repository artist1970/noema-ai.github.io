const BRANCH = "dictionary";

export const DICTIONARY_CLOUD_BUCKETS = Object.freeze({
  CORE_LETTERS: "core-letters",
  ACCESS_INDEXES: "access-indexes",
  EXTENDED_META: "extended-meta",
  EXTENDED_FALLBACK: "extended-payloads",
  IMPORTS: "imports",
  REVIEW: "review",
  SNAPSHOTS: "snapshots",
  SYSTEM: "system"
});

function cleanText(value = "", max = 220) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeLetter(value = "") {
  const letter = cleanText(value, 1).toUpperCase();
  if (!/^[A-Z]$/.test(letter)) throw new Error("dictionary-cloud-letter-invalid");
  return letter;
}

function indexKey(kind, id) {
  const safeKind = cleanText(kind, 60).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const safeId = cleanText(id, 120).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!safeKind || !safeId) throw new Error("dictionary-cloud-index-key-invalid");
  return `${safeKind}-${safeId}`;
}

function shardKey(id) {
  const safe = cleanText(id, 180).toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  if (!safe) throw new Error("dictionary-cloud-shard-key-invalid");
  return `extended-${safe}`;
}

function byteLength(value) {
  if (value instanceof Blob) return value.size;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  return new Blob([typeof value === "string" ? value : JSON.stringify(value ?? null)]).size;
}

export class DictionarySovereignCloud {
  constructor({ fabric = null } = {}) {
    if (!fabric) throw new Error("dictionary-sovereign-storage-fabric-required");
    this.fabric = fabric;
  }

  async initialize() {
    return await this.fabric.initialize({ requestPersistence: true });
  }

  async putCoreLetter(letter, payload, metadata = {}) {
    const normalized = normalizeLetter(letter);
    return await this.fabric.put(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.CORE_LETTERS,
      `letter-${normalized.toLowerCase()}`,
      payload,
      {
        metadata: {
          kind: "core-letter",
          letter: normalized,
          source: cleanText(metadata.source, 500),
          fetchedAt: cleanText(metadata.fetchedAt, 80) || new Date().toISOString()
        }
      }
    );
  }

  async getCoreLetter(letter) {
    const normalized = normalizeLetter(letter);
    const record = await this.fabric.get(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.CORE_LETTERS,
      `letter-${normalized.toLowerCase()}`
    );
    return record?.value || null;
  }

  async putAccessIndex(kind, id, payload, metadata = {}) {
    const key = indexKey(kind, id);
    return await this.fabric.put(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.ACCESS_INDEXES,
      key,
      payload,
      {
        metadata: {
          kind: cleanText(kind, 60),
          id: cleanText(id, 120),
          source: cleanText(metadata.source, 500),
          fetchedAt: cleanText(metadata.fetchedAt, 80) || new Date().toISOString()
        }
      }
    );
  }

  async getAccessIndex(kind, id) {
    const record = await this.fabric.get(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.ACCESS_INDEXES,
      indexKey(kind, id)
    );
    return record?.value || null;
  }

  async putExtendedShard(id, payload, {
    contentType = "application/json",
    source = "",
    forceStructured = false
  } = {}) {
    const key = shardKey(id);
    const bytes = byteLength(payload);
    let backend = "indexeddb";

    if (!forceStructured && this.fabric.largeObjects?.supported) {
      const result = await this.fabric.putLarge(BRANCH, key, payload, { contentType });
      if (result?.ok) backend = "opfs";
    }

    if (backend !== "opfs") {
      await this.fabric.put(
        BRANCH,
        DICTIONARY_CLOUD_BUCKETS.EXTENDED_FALLBACK,
        key,
        payload,
        { contentType, metadata: { bytes, source: cleanText(source, 500) } }
      );
    }

    const meta = {
      id: cleanText(id, 180),
      key,
      backend,
      bytes,
      contentType,
      source: cleanText(source, 500),
      updatedAt: new Date().toISOString()
    };

    await this.fabric.put(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.EXTENDED_META,
      key,
      meta,
      { metadata: { backend, bytes, contentType } }
    );

    return { ok: true, meta };
  }

  async getExtendedShard(id) {
    const key = shardKey(id);
    const metaRecord = await this.fabric.get(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.EXTENDED_META,
      key
    );
    const meta = metaRecord?.value;
    if (!meta) return null;

    let payload = null;
    if (meta.backend === "opfs") {
      payload = await this.fabric.getLarge(BRANCH, key);
    } else {
      const record = await this.fabric.get(
        BRANCH,
        DICTIONARY_CLOUD_BUCKETS.EXTENDED_FALLBACK,
        key
      );
      payload = record?.value ?? null;
    }

    return payload === null ? null : { meta, payload };
  }

  async deleteExtendedShard(id, { confirmed = false } = {}) {
    if (!confirmed) {
      return { ok: false, reason: "Explicit confirmation is required before deleting dictionary data." };
    }

    const key = shardKey(id);
    const metaRecord = await this.fabric.get(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.EXTENDED_META,
      key
    );
    const meta = metaRecord?.value;
    if (!meta) return { ok: false, reason: "not-found" };

    if (meta.backend === "opfs") {
      await this.fabric.deleteLarge(BRANCH, key, { confirmed: true });
    } else {
      await this.fabric.delete(
        BRANCH,
        DICTIONARY_CLOUD_BUCKETS.EXTENDED_FALLBACK,
        key,
        { confirmed: true }
      );
    }

    await this.fabric.delete(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.EXTENDED_META,
      key,
      { confirmed: true }
    );
    return { ok: true, deleted: id };
  }

  async putReviewSnapshot(id, payload) {
    return await this.fabric.put(
      BRANCH,
      DICTIONARY_CLOUD_BUCKETS.REVIEW,
      `review-${cleanText(id, 160).replace(/[^a-zA-Z0-9._-]+/g, "-")}`,
      payload,
      { metadata: { savedAt: new Date().toISOString() } }
    );
  }

  async status() {
    const [letters, indexes, shards, review] = await Promise.all([
      this.fabric.list(BRANCH, DICTIONARY_CLOUD_BUCKETS.CORE_LETTERS),
      this.fabric.list(BRANCH, DICTIONARY_CLOUD_BUCKETS.ACCESS_INDEXES),
      this.fabric.list(BRANCH, DICTIONARY_CLOUD_BUCKETS.EXTENDED_META),
      this.fabric.list(BRANCH, DICTIONARY_CLOUD_BUCKETS.REVIEW)
    ]);

    return {
      id: "naib-dictionary-sovereign-cloud",
      branch: BRANCH,
      localOnly: true,
      dependencyFree: true,
      coreLettersStored: letters.length,
      accessIndexesStored: indexes.length,
      extendedShardsStored: shards.length,
      reviewSnapshotsStored: review.length,
      storage: await this.fabric.status()
    };
  }
}
