import { makeStorageId } from "./storage-fabric-schema.js";

const BRANCH = "admin";
const INDEX_BUCKET = "docs-index";
const FALLBACK_BUCKET = "docs-payload";

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function metadataKey(id) {
  return `doc-${id}`;
}

export class AdminDocsVault {
  constructor({ fabric = null } = {}) {
    if (!fabric) throw new Error("admin-docs-storage-fabric-required");
    this.fabric = fabric;
  }

  async initialize() {
    return await this.fabric.initialize({ requestPersistence: true });
  }

  async saveFile(file, {
    folder = "General",
    notes = "",
    useLargeStore = true
  } = {}) {
    if (!(file instanceof Blob)) throw new Error("admin-doc-file-required");

    const id = makeStorageId("admin-doc");
    const name = cleanText(file.name || `document-${Date.now()}`, 240);
    const type = cleanText(file.type || "application/octet-stream", 160);
    const safeFolder = cleanText(folder || "General", 120) || "General";
    const createdAt = new Date().toISOString();

    let backend = "indexeddb";

    if (useLargeStore && this.fabric.largeObjects.supported) {
      const largeResult = await this.fabric.putLarge(BRANCH, id, file, { contentType: type });
      if (largeResult?.ok) backend = "opfs";
    }

    if (backend !== "opfs") {
      await this.fabric.put(BRANCH, FALLBACK_BUCKET, id, file, {
        contentType: type,
        metadata: { name, folder: safeFolder }
      });
    }

    const metadata = {
      id,
      name,
      type,
      size: Number(file.size) || 0,
      folder: safeFolder,
      notes: cleanText(notes, 1000),
      backend,
      createdAt,
      updatedAt: createdAt
    };

    await this.fabric.put(BRANCH, INDEX_BUCKET, metadataKey(id), metadata, {
      metadata: {
        name,
        folder: safeFolder,
        backend,
        bytes: metadata.size
      }
    });

    return { ok: true, metadata };
  }

  async saveText(name, text, options = {}) {
    const blob = new Blob([String(text ?? "")], {
      type: options.contentType || "text/plain;charset=utf-8"
    });
    Object.defineProperty(blob, "name", {
      value: cleanText(name, 240) || "document.txt"
    });
    return await this.saveFile(blob, options);
  }

  async getMetadata(id) {
    const item = await this.fabric.get(BRANCH, INDEX_BUCKET, metadataKey(id));
    return item?.value || null;
  }

  async getFile(id) {
    const metadata = await this.getMetadata(id);
    if (!metadata) return null;

    let blob = null;
    if (metadata.backend === "opfs") {
      blob = await this.fabric.getLarge(BRANCH, id);
    } else {
      const item = await this.fabric.get(BRANCH, FALLBACK_BUCKET, id);
      blob = item?.value instanceof Blob ? item.value : null;
    }

    if (!blob) return null;
    return { metadata, blob };
  }

  async list({ folder = "", query = "" } = {}) {
    const records = await this.fabric.list(BRANCH, INDEX_BUCKET);
    const values = [];

    for (const record of records) {
      const item = await this.fabric.get(BRANCH, INDEX_BUCKET, record.key);
      if (item?.value) values.push(item.value);
    }

    const folderNeedle = cleanText(folder, 120).toLowerCase();
    const queryNeedle = cleanText(query, 240).toLowerCase();

    return values
      .filter(item => !folderNeedle || String(item.folder).toLowerCase() === folderNeedle)
      .filter(item => {
        if (!queryNeedle) return true;
        return [item.name, item.folder, item.notes, item.type]
          .join(" ")
          .toLowerCase()
          .includes(queryNeedle);
      })
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async folders() {
    return [...new Set(
      (await this.list()).map(item => item.folder).filter(Boolean)
    )].sort();
  }

  async deleteFile(id, { confirmed = false } = {}) {
    if (!confirmed) {
      return {
        ok: false,
        reason: "Explicit confirmation is required before deleting an Admin document."
      };
    }

    const metadata = await this.getMetadata(id);
    if (!metadata) return { ok: false, reason: "not-found" };

    if (metadata.backend === "opfs") {
      await this.fabric.deleteLarge(BRANCH, id, { confirmed: true });
    } else {
      await this.fabric.delete(BRANCH, FALLBACK_BUCKET, id, { confirmed: true });
    }

    await this.fabric.delete(
      BRANCH,
      INDEX_BUCKET,
      metadataKey(id),
      { confirmed: true }
    );

    return { ok: true, deleted: id };
  }

  async exportIndex() {
    return {
      format: "naib-admin-docs-index",
      version: 1,
      exportedAt: new Date().toISOString(),
      documents: await this.list()
    };
  }

  async status() {
    const documents = await this.list();
    const totalBytes = documents.reduce(
      (sum, item) => sum + (Number(item.size) || 0),
      0
    );

    return {
      id: "naib-admin-docs-vault",
      localOnly: true,
      dependencyFree: true,
      documentCount: documents.length,
      totalBytes,
      storage: await this.fabric.status()
    };
  }
}
