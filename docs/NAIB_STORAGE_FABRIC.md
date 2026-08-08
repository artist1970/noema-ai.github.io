# NAIB Storage Fabric v1

NAIB Storage Fabric expands NAIB's dependency-free local storage architecture without adding authentication, account behavior, email delivery, or remote services.

## Four logical branches

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

## Capacity tiers

### IndexedDB
NAIB's existing Internal Cloud remains the structured metadata and chunked-record layer.

### OPFS
When supported, Origin Private File System is used as the large-object tier for Admin documents and future large payloads.

OPFS and IndexedDB are native browser APIs and require no external JavaScript libraries or cloud vendors.

## Important quota rule

Multiple NAIB branches do **not** multiply browser quota. Storage quota is generally managed per browser origin/device. The Storage Fabric improves separation, organization, large-file handling, and resilience while reporting the real browser-managed quota.

## Privacy/security boundary

The Admin Documents Vault is local storage, not an authentication system. It should not be described as remotely secure or as a replacement for encrypted server storage. Anyone who can access the same browser profile/device may potentially access locally stored files.

## API examples

```js
import { NAIBStorageFabric } from "./storage/storage-fabric-instance.js";

// Reserved Account Storage branch
await NAIBStorageFabric.put("account", "records", "example", { future: true });

// Reserved Communication Storage branch
await NAIBStorageFabric.put("communication", "archive", "example", { future: true });

// Admin branch
const admin = NAIBStorageFabric.branch("admin");
await admin.put("notes", "planning", { text: "Private local working note" });
```

## Admin UI

Open:

`/admin/docs-vault/`

The page is intentionally storage-only.
