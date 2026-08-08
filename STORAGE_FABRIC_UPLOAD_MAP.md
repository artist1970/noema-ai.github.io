# NAIB Storage Fabric v1 · Upload Map

Upload these files to the same paths in `artist1970/noema-ai.github.io`.

## New files

- `storage/storage-fabric-schema.js`
- `storage/large-object-store.js`
- `storage/storage-fabric.js`
- `storage/storage-fabric-instance.js`
- `storage/admin-docs-vault.js`
- `storage/admin-docs-vault-instance.js`
- `admin/docs-vault/index.html`
- `docs/NAIB_STORAGE_FABRIC.md`
- `tests/storage-fabric.test.mjs`
- `tests/admin-docs-vault.test.mjs`

## Replace

- `service-worker.js`

The replacement service worker only bumps the cache version and adds the new storage modules/Admin Vault page to the offline shell.

## Existing files this package uses but does not replace

- `storage/internal-cloud-schema.js`
- `storage/internal-cloud.js`
- `storage/internal-cloud-instance.js`
