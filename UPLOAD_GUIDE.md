# NOEMA v0.5 — Memory + Context

Upload the contents of this package to:

`artist1970/noema-ai.github.io`

while preserving folders.

## New files

```text
memory/memory-schema.js
memory/memory-store.js
memory/memory-retriever.js
memory/project-context-store.js
memory/sensitive-memory-filter.js

styles/noema-memory.css

docs/MEMORY_ARCHITECTURE.md
docs/PROJECT_CONTEXT.md
```

## Replace existing files

```text
index.html
app/noema-app.js
core/context-builder.js
core/noema-core.js
permissions/capability-ledger.js
service-worker.js
```

## New behavior

- `Memory & Context` button in the NOEMA workspace.
- Explicit Memory Library.
- Editable/deleteable retained items.
- Memory provenance and timestamps.
- Memory scopes and tags.
- JSON export.
- Project Context with one active project.
- Context-aware memory retrieval.
- Credential-like information rejected from ordinary long-term memory.
- Existing short-term continuity remains bounded at 24 exchanges.
- Cache moves to `noema-shell-v0.5.0`.

No conversational model is connected by this package.
