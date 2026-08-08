import {
  NAIB_STORAGE_FABRIC,
  normalizeStorageBranch,
  safeObjectKey
} from "./storage-fabric-schema.js";

function asBlob(value, type = "application/octet-stream") {
  if (value instanceof Blob) return value;
  if (value instanceof ArrayBuffer) return new Blob([value], { type });
  if (ArrayBuffer.isView(value)) {
    return new Blob(
      [value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)],
      { type }
    );
  }
  if (typeof value === "string") return new Blob([value], { type: type || "text/plain" });
  return new Blob([JSON.stringify(value ?? null)], { type: "application/json" });
}

function filenameFor(key) {
  return encodeURIComponent(safeObjectKey(key)).replace(/%/g, "_");
}

export class LargeObjectStore {
  constructor({ navigatorImpl = globalThis.navigator } = {}) {
    this.navigator = navigatorImpl;
    this.root = null;
  }

  get supported() {
    return typeof this.navigator?.storage?.getDirectory === "function";
  }

  async initialize() {
    if (!this.supported) return { ok: false, backend: "unavailable" };
    if (!this.root) {
      const originRoot = await this.navigator.storage.getDirectory();
      this.root = await originRoot.getDirectoryHandle(NAIB_STORAGE_FABRIC.OPFS_ROOT, { create: true });
    }
    return { ok: true, backend: "opfs" };
  }

  async #branchDirectory(branch) {
    await this.initialize();
    if (!this.root) throw new Error("opfs-unavailable");
    return await this.root.getDirectoryHandle(normalizeStorageBranch(branch), { create: true });
  }

  async put(branch, key, value, { contentType = "" } = {}) {
    if (!this.supported) return { ok: false, reason: "opfs-unavailable" };
    const directory = await this.#branchDirectory(branch);
    const fileHandle = await directory.getFileHandle(filenameFor(key), { create: true });
    const writable = await fileHandle.createWritable();
    const blob = asBlob(value, contentType || value?.type || "application/octet-stream");
    await writable.write(blob);
    await writable.close();
    return {
      ok: true,
      backend: "opfs",
      branch: normalizeStorageBranch(branch),
      key: safeObjectKey(key),
      bytes: blob.size,
      contentType: blob.type || contentType || "application/octet-stream"
    };
  }

  async get(branch, key) {
    if (!this.supported) return null;
    try {
      const directory = await this.#branchDirectory(branch);
      const fileHandle = await directory.getFileHandle(filenameFor(key));
      return await fileHandle.getFile();
    } catch (error) {
      if (error?.name === "NotFoundError") return null;
      throw error;
    }
  }

  async delete(branch, key, { confirmed = false } = {}) {
    if (!confirmed) {
      return { ok: false, reason: "Explicit confirmation is required before deleting a large object." };
    }
    if (!this.supported) return { ok: false, reason: "opfs-unavailable" };
    try {
      const directory = await this.#branchDirectory(branch);
      await directory.removeEntry(filenameFor(key));
      return { ok: true };
    } catch (error) {
      if (error?.name === "NotFoundError") return { ok: false, reason: "not-found" };
      throw error;
    }
  }

  async list(branch) {
    if (!this.supported) return [];
    const directory = await this.#branchDirectory(branch);
    const names = [];
    for await (const [name, handle] of directory.entries()) {
      if (handle.kind === "file") names.push(name);
    }
    return names.sort();
  }

  async status() {
    let persisted = false;
    let quota = null;
    let usage = null;
    if (this.navigator?.storage?.persisted) {
      try { persisted = await this.navigator.storage.persisted(); } catch {}
    }
    if (this.navigator?.storage?.estimate) {
      try {
        const estimate = await this.navigator.storage.estimate();
        quota = Number.isFinite(Number(estimate?.quota)) ? Number(estimate.quota) : null;
        usage = Number.isFinite(Number(estimate?.usage)) ? Number(estimate.usage) : null;
      } catch {}
    }
    return {
      id: "naib-large-object-store",
      supported: this.supported,
      backend: this.supported ? "opfs" : "unavailable",
      persisted,
      browserQuota: quota,
      browserUsage: usage
    };
  }
}
