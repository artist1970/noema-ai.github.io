export const NAIB_STORAGE_FABRIC = Object.freeze({
  FORMAT: "naib-storage-fabric",
  VERSION: 1,
  OPFS_ROOT: "naib-storage-fabric",
  LARGE_OBJECT_THRESHOLD_BYTES: 4 * 1024 * 1024
});

export const NAIB_STORAGE_BRANCHES = Object.freeze({
  internal: Object.freeze({
    id: "internal",
    title: "Internal Cloud",
    purpose: "Learning, research, artifacts, portfolios, and federation cache."
  }),
  account: Object.freeze({
    id: "account",
    title: "Account Storage",
    purpose: "Reserved high-capacity storage branch for future account and family records."
  }),
  communication: Object.freeze({
    id: "communication",
    title: "Communication Storage",
    purpose: "Reserved high-capacity storage branch for future communication records."
  }),
  admin: Object.freeze({
    id: "admin",
    title: "Admin Documents Vault",
    purpose: "Private local working-document storage for the site administrator."
  })
});

function clean(value, max = 80) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9._:/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/.]+|[-/.]+$/g, "")
    .slice(0, max);
}

export function normalizeStorageBranch(value = "internal") {
  const branch = clean(value, 40).toLowerCase() || "internal";
  if (!Object.hasOwn(NAIB_STORAGE_BRANCHES, branch)) {
    throw new Error(`unknown-storage-branch:${branch}`);
  }
  return branch;
}

export function normalizeBucket(value = "records") {
  return clean(value, 60).toLowerCase() || "records";
}

export function fabricNamespace(branch, bucket = "records") {
  return `fabric-${normalizeStorageBranch(branch)}-${normalizeBucket(bucket)}`;
}

export function safeObjectKey(value = "") {
  const key = clean(value, 220);
  if (!key) throw new Error("storage-object-key-required");
  return key;
}

export function makeStorageId(prefix = "object") {
  const safePrefix = clean(prefix, 50) || "object";
  if (globalThis.crypto?.randomUUID) return `${safePrefix}-${crypto.randomUUID()}`;
  return `${safePrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
