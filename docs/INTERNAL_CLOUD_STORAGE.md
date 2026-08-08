# NAIB Internal Cloud Storage

## Purpose

NAIB Internal Cloud is the dependency-free, high-capacity persistence layer for the NAIB / NOEMA public application.

The phrase **Internal Cloud** describes a cloud-like local vault owned by the application and the browser profile. In the current GitHub Pages deployment it is **not a remote cross-device cloud service**. Cross-device sync remains intentionally unavailable until a secure account host is deliberately configured.

## Why it exists

The existing NOEMA relationship spine uses `localStorage` for small, frequently accessed records such as:

- preferences;
- enrollment;
- mentor relationship state;
- short continuity;
- the intentionally bounded Memory Library;
- lightweight project context.

Those stores should stay small and fast.

The Internal Cloud is for larger or more numerous records:

- research evidence and source packages;
- long conversation archives that the user explicitly chooses to retain;
- portfolio and learning evidence;
- drawings, images, generated reports and attachments;
- project artifacts;
- federation manifest caches and repository inventories;
- export packages;
- future offline working sets.

## Implementation

No external library, database service, SDK, tracker, or cloud vendor is required.

Primary browser backend:

- IndexedDB for metadata and chunked `Blob` payloads;
- 1 MiB default chunks;
- browser Storage API for quota estimates;
- `navigator.storage.persist()` for an explicit persistence request where supported.

Fallback:

- an in-memory backend is used when IndexedDB is unavailable. This fallback is intentionally non-persistent and is exposed as such in status reporting.

The browser controls the actual storage quota. NAIB never promises a fixed number of gigabytes. A device with sufficient free disk space can generally grant much more capacity to IndexedDB than `localStorage`, but the exact quota varies by browser, device, privacy mode, and user settings.

## Namespaces

The initial reserved namespaces are:

- `artifacts`
- `attachments`
- `conversation-archive`
- `evidence`
- `exports`
- `federation-cache`
- `learning`
- `memory-archive`
- `portfolio`
- `projects`
- `research`
- `system`

Additional normalized namespaces can be used without changing the database schema.

## Record contract

Every saved object has:

- a namespace;
- a key;
- byte size;
- MIME type;
- encoding;
- chunk count;
- created and updated timestamps;
- bounded user/application metadata.

Values may be JSON-compatible objects, strings, `Blob`s, `ArrayBuffer`s, or typed arrays.

## Privacy and deletion

The Internal Cloud is local-first and same-origin. It is not automatically uploaded anywhere.

Deletion methods require explicit confirmation.

The public application must not store passwords, API keys, bearer tokens, database credentials, authentication secrets, or other forbidden secret material in the Internal Cloud.

## Remote sync boundary

A future secure account service may replicate approved Internal Cloud records, but the local storage contract must remain independent of that server.

Remote replication must be:

1. authenticated;
2. permission-scoped;
3. encrypted in transit;
4. explicit about what namespaces are synchronized;
5. guardian-aware for child accounts;
6. removable;
7. unable to grant itself additional NOEMA capabilities.

Until that service exists, `remoteSync` is reported as `false`.

## Federation use

The ecosystem-wide federation scanner can use the `federation-cache` namespace for repository manifests, normalized resource inventories, scan timestamps, and provenance records.

This allows NAIB to scan a large Verve N Veda / Khaemenes resource network without forcing every fetched manifest or repository inventory into `localStorage`.
