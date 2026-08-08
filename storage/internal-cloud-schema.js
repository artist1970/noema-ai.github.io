export const NAIB_CLOUD = Object.freeze({
  DB_NAME: "naib_internal_cloud_v1",
  DB_VERSION: 1,
  RECORDS_STORE: "records",
  CHUNKS_STORE: "chunks",
  META_STORE: "meta",
  FORMAT: "naib-internal-cloud",
  FORMAT_VERSION: 1,
  DEFAULT_CHUNK_BYTES: 1024 * 1024,
  MAX_KEY_LENGTH: 220,
  MAX_NAMESPACE_LENGTH: 80
});

export const NAIB_CLOUD_NAMESPACES = Object.freeze([
  "artifacts",
  "attachments",
  "conversation-archive",
  "evidence",
  "exports",
  "federation-cache",
  "learning",
  "memory-archive",
  "portfolio",
  "projects",
  "research",
  "system"
]);

function clean(value, max) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9._:/-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, max);
}

export function normalizeNamespace(value = "artifacts") {
  return clean(value || "artifacts", NAIB_CLOUD.MAX_NAMESPACE_LENGTH) || "artifacts";
}

export function normalizeKey(value = "") {
  const key = clean(value, NAIB_CLOUD.MAX_KEY_LENGTH);
  if (!key) throw new Error("cloud-key-required");
  return key;
}

export function cloudRecordId(namespace, key) {
  return `${normalizeNamespace(namespace)}::${normalizeKey(key)}`;
}

export function normalizeCloudMetadata(input = {}) {
  const out = {};
  for (const [key, value] of Object.entries(input || {})) {
    const name = clean(key, 80);
    if (!name) continue;
    if (typeof value === "string") out[name] = value.slice(0, 1200);
    else if (typeof value === "number" && Number.isFinite(value)) out[name] = value;
    else if (typeof value === "boolean" || value === null) out[name] = value;
    else if (Array.isArray(value)) {
      out[name] = value.slice(0, 40).map(item =>
        ["string", "number", "boolean"].includes(typeof item)
          ? (typeof item === "string" ? item.slice(0, 300) : item)
          : String(item).slice(0, 300)
      );
    }
  }
  return out;
}

export function makeCloudKey(prefix = "record") {
  const safePrefix = normalizeNamespace(prefix);
  if (globalThis.crypto?.randomUUID) return `${safePrefix}-${crypto.randomUUID()}`;
  return `${safePrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
