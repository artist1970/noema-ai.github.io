# NOEMA v0.7 — Avatar Foundry + Mentor Adoption

Upload into:

`artist1970/noema-ai.github.io`

preserving all folders.

## New files

```text
avatars/
  appearance-catalog.js
  personality-catalog.js
  voice-profile.js
  sketch-refiner.js
  sketch-store.js
  sketch-canvas.js
  avatar-schema.js
  avatar-store.js
  avatar-supervisor.js
  avatar-renderer.js
  avatar-foundry.js

adapters/
  moirai-refinement-adapter.js

schemas/
  avatar-manifest.schema.json
  avatar-sketch.schema.json

styles/
  noema-avatar.css

docs/
  AVATAR_FOUNDRY_ARCHITECTURE.md
  BAZAAR_ART_LINEAGE.md
  MOIRAI_AVATAR_REFINEMENT_PROTOCOL.md

tests/
  avatar-schema.test.mjs
  avatar-supervisor.test.mjs
  sketch-refiner.test.mjs
  avatar-foundry.test.mjs
  context-avatar.test.mjs
```

## Replace

```text
index.html
app/noema-app.js
core/context-builder.js
core/noema-core.js
permissions/capability-ledger.js
service-worker.js
```

## Release behavior

- `Adopt a Mentor` opens the Foundry.
- Any supported age / learning stage uses the same mentor architecture.
- Build path: select features.
- Draw path: create a rough mentor sketch.
- Bazaar Art-inspired guide layer, brush, opacity, eraser, undo/redo and symmetry assist.
- Local cleanup smooths rough lines.
- Original drawing remains preserved.
- Future Moirai refinement seam exists but is not falsely shown as connected.
- Appearance and drawings never feed learner/demographic/psychological inference.
- Mentor adoption requires explicit confirmation.
- Avatar customization cannot elevate permissions.
- Cache version: `noema-shell-v0.7.0`.
