# NAIB Storage Fabric v2

NAIB Storage Fabric expands NAIB's dependency-free local storage architecture without adding authentication, account behavior, email delivery, or remote services.

## Five logical branches

1. **Internal Cloud**
   - learning
   - research
   - portfolio
   - artifacts
   - federation cache

2. **Account Storage**
   - reserved storage capacity only
   - no login/authentication behavior is implemented by this package

3. **Communication Storage**
   - reserved storage capacity only
   - no email, notification, SMTP, or delivery behavior is implemented by this package

4. **Admin Documents Vault**
   - local administrator document storage
   - upload/download
   - folders/categories
   - search
   - local notes
   - index export
   - individual deletion

5. **Dictionary Sovereign Cloud**
   - dedicated local-first storage for AuroraCore dictionary data
   - A–Z core letter collections
   - word-length indexes
   - grade-band and exact-grade indexes
   - review and import snapshots
   - future extended-lexicon shards
   - OPFS large-object storage when supported

## Dictionary architecture

AuroraCore remains the canonical published dictionary source. NAIB's Dictionary Sovereign Cloud is the persistent local runtime layer.

```text
AuroraCore canonical dictionary
        ↓
A–Z letter collections
        ↓
generated access indexes
        ├── by word length
        ├── by grade band
        └── by exact grade
        ↓
Dictionary Sovereign Cloud
        ├── core-letters
        ├── access-indexes
        ├── extended-meta
        ├── extended-payloads
        ├── imports
        ├── review
        └── snapshots
```

Definitions are not copied into every access index. A word has one canonical dictionary record; generated indexes store lightweight references such as the word, source letter, word length, and selected routing metadata. This prevents definition drift.

Word length is a navigation aid, not a grade-level claim. Grade indexes are populated only from explicit `gradeBands` or `grades` metadata stored on an entry.

## Capacity tiers

### IndexedDB
NAIB's existing Internal Cloud remains the structured metadata and chunked-record layer. The Dictionary Sovereign Cloud uses isolated dictionary namespaces inside the same storage fabric.

### OPFS
When supported, Origin Private File System is used as the large-object tier for Admin documents and future large dictionary/lexical shards.

OPFS and IndexedDB are native browser APIs and require no external JavaScript libraries or cloud vendors.

## Important quota rule

Multiple NAIB branches do **not** multiply browser quota. Storage quota is generally managed per browser origin/device. The Storage Fabric improves separation, organization, large-file handling, and resilience while reporting the real browser-managed quota.

## Privacy/security boundary

The Admin Documents Vault and Dictionary Sovereign Cloud are local storage layers, not authentication systems. They should not be described as remotely secure or as replacements for an authenticated encrypted server.

## API examples

```js
import { NAIBStorageFabric } from "./storage/storage-fabric-instance.js";
import { NAIBDictionaryCloud } from "./storage/dictionary-sovereign-cloud-instance.js";

// Reserved Account Storage branch
await NAIBStorageFabric.put("account", "records", "example", { future: true });

// Reserved Communication Storage branch
await NAIBStorageFabric.put("communication", "archive", "example", { future: true });

// Admin branch
const admin = NAIBStorageFabric.branch("admin");
await admin.put("notes", "planning", { text: "Private local working note" });

// Dictionary branch
await NAIBDictionaryCloud.putCoreLetter("A", {
  letter: "A",
  entries: []
});
```

## Admin UI

Open:

`/admin/docs-vault/`

The page is intentionally storage-only.
