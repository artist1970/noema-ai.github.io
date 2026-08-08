import { LargeObjectStore } from "./large-object-store.js";
import {
  NAIB_STORAGE_BRANCHES,
  NAIB_STORAGE_FABRIC,
  fabricNamespace,
  normalizeStorageBranch,
  safeObjectKey
} from "./storage-fabric-schema.js";

export class StorageFabric {
  constructor({
    metadataCloud = null,
    largeObjectStore = new LargeObjectStore()
  } = {}) {
    this.cloud = metadataCloud;
    this.largeObjects = largeObjectStore;
  }

  #requireCloud() {
    if (!this.cloud) throw new Error("storage-fabric-metadata-cloud-required");
    return this.cloud;
  }

  async initialize({ requestPersistence = true } = {}) {
    const cloud = this.#requireCloud();
    const indexed = await cloud.initialize({ requestPersistence });
    const large = await this.largeObjects.initialize();
    return {
      ok: true,
      format: NAIB_STORAGE_FABRIC.FORMAT,
      version: NAIB_STORAGE_FABRIC.VERSION,
      indexed,
      large
    };
  }

  namespace(branch, bucket = "records") {
    return fabricNamespace(branch, bucket);
  }

  async put(branch, bucket, key, value, options = {}) {
    return await this.#requireCloud().put(
      this.namespace(branch, bucket),
      safeObjectKey(key),
      value,
      options
    );
  }

  async get(branch, bucket, key) {
    return await this.#requireCloud().get(
      this.namespace(branch, bucket),
      safeObjectKey(key)
    );
  }

  async list(branch, bucket = "records") {
    return await this.#requireCloud().list(this.namespace(branch, bucket));
  }

  async delete(branch, bucket, key, { confirmed = false } = {}) {
    return await this.#requireCloud().delete(
      this.namespace(branch, bucket),
      safeObjectKey(key),
      { confirmed }
    );
  }

  async putLarge(branch, key, value, options = {}) {
    normalizeStorageBranch(branch);
    return await this.largeObjects.put(branch, safeObjectKey(key), value, options);
  }

  async getLarge(branch, key) {
    normalizeStorageBranch(branch);
    return await this.largeObjects.get(branch, safeObjectKey(key));
  }

  async deleteLarge(branch, key, options = {}) {
    normalizeStorageBranch(branch);
    return await this.largeObjects.delete(branch, safeObjectKey(key), options);
  }

  branch(branch) {
    const id = normalizeStorageBranch(branch);
    const descriptor = NAIB_STORAGE_BRANCHES[id];
    return Object.freeze({
      ...descriptor,
      put: (bucket, key, value, options) => this.put(id, bucket, key, value, options),
      get: (bucket, key) => this.get(id, bucket, key),
      list: bucket => this.list(id, bucket),
      delete: (bucket, key, options) => this.delete(id, bucket, key, options),
      putLarge: (key, value, options) => this.putLarge(id, key, value, options),
      getLarge: key => this.getLarge(id, key),
      deleteLarge: (key, options) => this.deleteLarge(id, key, options)
    });
  }

  async status() {
    return {
      id: "naib-storage-fabric",
      version: NAIB_STORAGE_FABRIC.VERSION,
      dependencyFree: true,
      branches: Object.values(NAIB_STORAGE_BRANCHES),
      internalCloud: await this.#requireCloud().status(),
      largeObjectStore: await this.largeObjects.status()
    };
  }
}
