import {
  NAIB_CLOUD,
  cloudRecordId,
  normalizeCloudMetadata,
  normalizeKey,
  normalizeNamespace
} from "./internal-cloud-schema.js";

function requestPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("indexeddb-request-failed"));
  });
}

function transactionPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onabort = () => reject(transaction.error || new Error("indexeddb-transaction-aborted"));
    transaction.onerror = () => reject(transaction.error || new Error("indexeddb-transaction-failed"));
  });
}

function bytesLabel(bytes = 0) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

function serializeValue(value, contentType = "") {
  if (value instanceof Blob) {
    return {
      blob: value,
      encoding: "blob",
      contentType: value.type || contentType || "application/octet-stream"
    };
  }

  if (value instanceof ArrayBuffer) {
    return {
      blob: new Blob([value], { type: contentType || "application/octet-stream" }),
      encoding: "arraybuffer",
      contentType: contentType || "application/octet-stream"
    };
  }

  if (ArrayBuffer.isView(value)) {
    return {
      blob: new Blob([value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)], {
        type: contentType || "application/octet-stream"
      }),
      encoding: "arraybuffer",
      contentType: contentType || "application/octet-stream"
    };
  }

  if (typeof value === "string") {
    return {
      blob: new Blob([value], { type: contentType || "text/plain;charset=utf-8" }),
      encoding: "text",
      contentType: contentType || "text/plain;charset=utf-8"
    };
  }

  const json = JSON.stringify(value ?? null);
  return {
    blob: new Blob([json], { type: contentType || "application/json" }),
    encoding: "json",
    contentType: contentType || "application/json"
  };
}

async function deserializeValue(blob, encoding) {
  if (encoding === "blob") return blob;
  if (encoding === "arraybuffer") return await blob.arrayBuffer();
  if (encoding === "text") return await blob.text();
  if (encoding === "json") {
    const text = await blob.text();
    return JSON.parse(text || "null");
  }
  return blob;
}

class MemoryCloudBackend {
  constructor() {
    this.records = new Map();
    this.values = new Map();
  }

  async initialize() {
    return { backend: "memory-fallback", persistent: false };
  }

  async put(record, blob) {
    this.records.set(record.id, { ...record });
    this.values.set(record.id, blob);
  }

  async getRecord(id) {
    return this.records.get(id) || null;
  }

  async getBlob(id) {
    return this.values.get(id) || null;
  }

  async list(namespace = "") {
    return [...this.records.values()]
      .filter(item => !namespace || item.namespace === namespace)
      .map(item => ({ ...item }))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async delete(id) {
    const existed = this.records.delete(id);
    this.values.delete(id);
    return existed;
  }

  async clearNamespace(namespace) {
    let count = 0;
    for (const record of [...this.records.values()]) {
      if (record.namespace !== namespace) continue;
      this.records.delete(record.id);
      this.values.delete(record.id);
      count++;
    }
    return count;
  }

  async clearAll() {
    const count = this.records.size;
    this.records.clear();
    this.values.clear();
    return count;
  }
}

class IndexedDbCloudBackend {
  constructor({ indexedDBImpl = globalThis.indexedDB } = {}) {
    this.indexedDB = indexedDBImpl;
    this.db = null;
  }

  async initialize() {
    if (!this.indexedDB) throw new Error("indexeddb-unavailable");
    if (this.db) return { backend: "indexeddb", persistent: true };

    const openRequest = this.indexedDB.open(NAIB_CLOUD.DB_NAME, NAIB_CLOUD.DB_VERSION);

    openRequest.onupgradeneeded = event => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(NAIB_CLOUD.RECORDS_STORE)) {
        const records = db.createObjectStore(NAIB_CLOUD.RECORDS_STORE, { keyPath: "id" });
        records.createIndex("namespace", "namespace", { unique: false });
        records.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(NAIB_CLOUD.CHUNKS_STORE)) {
        const chunks = db.createObjectStore(NAIB_CLOUD.CHUNKS_STORE, { keyPath: ["recordId", "index"] });
        chunks.createIndex("recordId", "recordId", { unique: false });
      }

      if (!db.objectStoreNames.contains(NAIB_CLOUD.META_STORE)) {
        db.createObjectStore(NAIB_CLOUD.META_STORE, { keyPath: "key" });
      }
    };

    this.db = await requestPromise(openRequest);
    this.db.onversionchange = () => {
      try { this.db?.close(); } catch {}
      this.db = null;
    };

    return { backend: "indexeddb", persistent: true };
  }

  async put(record, blob) {
    await this.initialize();
    const tx = this.db.transaction(
      [NAIB_CLOUD.RECORDS_STORE, NAIB_CLOUD.CHUNKS_STORE],
      "readwrite"
    );
    const records = tx.objectStore(NAIB_CLOUD.RECORDS_STORE);
    const chunks = tx.objectStore(NAIB_CLOUD.CHUNKS_STORE);
    const byRecord = chunks.index("recordId");

    const oldKeys = await requestPromise(byRecord.getAllKeys(record.id));
    for (const key of oldKeys) chunks.delete(key);

    const chunkSize = record.chunkBytes;
    for (let index = 0, offset = 0; offset < blob.size; index++, offset += chunkSize) {
      chunks.put({
        recordId: record.id,
        index,
        blob: blob.slice(offset, Math.min(offset + chunkSize, blob.size), record.contentType)
      });
    }

    records.put(record);
    await transactionPromise(tx);
  }

  async getRecord(id) {
    await this.initialize();
    const tx = this.db.transaction(NAIB_CLOUD.RECORDS_STORE, "readonly");
    return await requestPromise(tx.objectStore(NAIB_CLOUD.RECORDS_STORE).get(id));
  }

  async getBlob(id) {
    await this.initialize();
    const tx = this.db.transaction(NAIB_CLOUD.CHUNKS_STORE, "readonly");
    const chunks = await requestPromise(tx.objectStore(NAIB_CLOUD.CHUNKS_STORE).index("recordId").getAll(id));
    chunks.sort((a, b) => a.index - b.index);
    if (!chunks.length) return new Blob([]);
    return new Blob(chunks.map(chunk => chunk.blob), { type: chunks[0].blob?.type || "" });
  }

  async list(namespace = "") {
    await this.initialize();
    const tx = this.db.transaction(NAIB_CLOUD.RECORDS_STORE, "readonly");
    const store = tx.objectStore(NAIB_CLOUD.RECORDS_STORE);
    const rows = namespace
      ? await requestPromise(store.index("namespace").getAll(namespace))
      : await requestPromise(store.getAll());
    return rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async delete(id) {
    await this.initialize();
    const existing = await this.getRecord(id);
    if (!existing) return false;

    const tx = this.db.transaction(
      [NAIB_CLOUD.RECORDS_STORE, NAIB_CLOUD.CHUNKS_STORE],
      "readwrite"
    );
    const records = tx.objectStore(NAIB_CLOUD.RECORDS_STORE);
    const chunks = tx.objectStore(NAIB_CLOUD.CHUNKS_STORE);
    const oldKeys = await requestPromise(chunks.index("recordId").getAllKeys(id));
    for (const key of oldKeys) chunks.delete(key);
    records.delete(id);
    await transactionPromise(tx);
    return true;
  }

  async clearNamespace(namespace) {
    const rows = await this.list(namespace);
    let count = 0;
    for (const row of rows) {
      if (await this.delete(row.id)) count++;
    }
    return count;
  }

  async clearAll() {
    await this.initialize();
    const rows = await this.list();
    const tx = this.db.transaction(
      [NAIB_CLOUD.RECORDS_STORE, NAIB_CLOUD.CHUNKS_STORE, NAIB_CLOUD.META_STORE],
      "readwrite"
    );
    tx.objectStore(NAIB_CLOUD.RECORDS_STORE).clear();
    tx.objectStore(NAIB_CLOUD.CHUNKS_STORE).clear();
    tx.objectStore(NAIB_CLOUD.META_STORE).clear();
    await transactionPromise(tx);
    return rows.length;
  }
}

export class InternalCloud {
  constructor({
    indexedDBImpl = globalThis.indexedDB,
    navigatorImpl = globalThis.navigator,
    chunkBytes = NAIB_CLOUD.DEFAULT_CHUNK_BYTES
  } = {}) {
    this.navigator = navigatorImpl;
    this.chunkBytes = Math.max(256 * 1024, Math.min(4 * 1024 * 1024, Number(chunkBytes) || NAIB_CLOUD.DEFAULT_CHUNK_BYTES));
    this.backend = indexedDBImpl
      ? new IndexedDbCloudBackend({ indexedDBImpl })
      : new MemoryCloudBackend();
    this.backendName = indexedDBImpl ? "indexeddb" : "memory-fallback";
    this.initialized = false;
  }

  async initialize({ requestPersistence = false } = {}) {
    const backend = await this.backend.initialize();
    this.initialized = true;

    let persistence = {
      supported: Boolean(this.navigator?.storage),
      persisted: false,
      requested: false
    };

    if (this.navigator?.storage?.persisted) {
      try { persistence.persisted = await this.navigator.storage.persisted(); } catch {}
    }

    if (requestPersistence && !persistence.persisted && this.navigator?.storage?.persist) {
      persistence.requested = true;
      try { persistence.persisted = await this.navigator.storage.persist(); } catch {}
    }

    return { ok: true, backend: backend.backend, persistence };
  }

  async put(namespace, key, value, options = {}) {
    const ns = normalizeNamespace(namespace);
    const safeKey = normalizeKey(key);
    const id = cloudRecordId(ns, safeKey);
    const serialized = serializeValue(value, options.contentType);
    const previous = await this.backend.getRecord(id);
    const now = new Date().toISOString();
    const chunkCount = Math.max(1, Math.ceil(serialized.blob.size / this.chunkBytes));

    const record = {
      id,
      namespace: ns,
      key: safeKey,
      bytes: serialized.blob.size,
      bytesLabel: bytesLabel(serialized.blob.size),
      contentType: serialized.contentType,
      encoding: serialized.encoding,
      chunkBytes: this.chunkBytes,
      chunkCount,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
      metadata: normalizeCloudMetadata(options.metadata)
    };

    await this.backend.put(record, serialized.blob);
    return { ok: true, record: { ...record } };
  }

  async get(namespace, key) {
    const id = cloudRecordId(namespace, key);
    const record = await this.backend.getRecord(id);
    if (!record) return null;
    const blob = await this.backend.getBlob(id);
    return {
      record: { ...record },
      value: await deserializeValue(blob, record.encoding)
    };
  }

  async getRecord(namespace, key) {
    const record = await this.backend.getRecord(cloudRecordId(namespace, key));
    return record ? { ...record } : null;
  }

  async list(namespace = "") {
    const ns = namespace ? normalizeNamespace(namespace) : "";
    return (await this.backend.list(ns)).map(item => ({ ...item }));
  }

  async delete(namespace, key, { confirmed = false } = {}) {
    if (!confirmed) return { ok: false, reason: "Explicit confirmation is required before deleting Internal Cloud data." };
    const deleted = await this.backend.delete(cloudRecordId(namespace, key));
    return {
      ok: deleted,
      reason: deleted ? "Internal Cloud record deleted." : "Internal Cloud record not found."
    };
  }

  async clearNamespace(namespace, { confirmed = false } = {}) {
    if (!confirmed) return { ok: false, reason: "Explicit confirmation is required before clearing an Internal Cloud namespace." };
    const ns = normalizeNamespace(namespace);
    const count = await this.backend.clearNamespace(ns);
    return { ok: true, namespace: ns, deleted: count };
  }

  async clearAll({ confirmed = false } = {}) {
    if (!confirmed) return { ok: false, reason: "Explicit confirmation is required before clearing the NAIB Internal Cloud." };
    const count = await this.backend.clearAll();
    return { ok: true, deleted: count, reason: "NAIB Internal Cloud cleared." };
  }

  async requestPersistence() {
    if (!this.navigator?.storage?.persist) {
      return { supported: false, persisted: false };
    }
    let persisted = false;
    try { persisted = await this.navigator.storage.persist(); } catch {}
    return { supported: true, persisted };
  }

  async estimate() {
    let quota = null;
    let usage = null;
    let persisted = false;

    if (this.navigator?.storage?.estimate) {
      try {
        const result = await this.navigator.storage.estimate();
        quota = Number.isFinite(Number(result?.quota)) ? Number(result.quota) : null;
        usage = Number.isFinite(Number(result?.usage)) ? Number(result.usage) : null;
      } catch {}
    }

    if (this.navigator?.storage?.persisted) {
      try { persisted = await this.navigator.storage.persisted(); } catch {}
    }

    const records = await this.list();
    const cloudBytes = records.reduce((sum, record) => sum + (Number(record.bytes) || 0), 0);

    return {
      backend: this.backendName,
      persisted,
      recordCount: records.length,
      cloudBytes,
      cloudBytesLabel: bytesLabel(cloudBytes),
      browserUsage: usage,
      browserUsageLabel: usage === null ? "unknown" : bytesLabel(usage),
      browserQuota: quota,
      browserQuotaLabel: quota === null ? "browser-managed" : bytesLabel(quota),
      availableEstimate: quota !== null && usage !== null ? Math.max(0, quota - usage) : null,
      availableEstimateLabel: quota !== null && usage !== null ? bytesLabel(Math.max(0, quota - usage)) : "browser-managed"
    };
  }

  async status() {
    const estimate = await this.estimate();
    return {
      id: "naib-internal-cloud",
      version: NAIB_CLOUD.FORMAT_VERSION,
      localOnly: true,
      remoteSync: false,
      dependencyFree: true,
      indexedDB: this.backendName === "indexeddb",
      ...estimate
    };
  }

  async exportIndex() {
    return {
      format: NAIB_CLOUD.FORMAT,
      version: NAIB_CLOUD.FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      note: "Metadata index only. Large binary payloads remain in the local NAIB Internal Cloud.",
      records: await this.list()
    };
  }
}
