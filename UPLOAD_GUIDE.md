# NAIB v1.2 — Specialist Runtime & Resource Discovery

This is a full merged repository.

Upload all contents into the existing repository:

`artist1970/noema-ai.github.io`

Keep the repository name unchanged for this release.

## New runtime

```text
resources/
  execution-state.js
  approved-manifest-sources.js
  resource-manifest.js
  resource-manifest-loader.js
  resource-eligibility.js
  resource-ranker.js
  resource-director.js
  snapshots/
    manifest-snapshots.js
    khaemenes-academy.manifest.json
    arshif.manifest.json
    plera-search.manifest.json

specialists/
  adapter-contract.js

adapters/
  khaemenes-resource-adapter.js
  arshif-resource-adapter.js
  plera-search-resource-adapter.js
```

## Public behavior

NAIB can now surface a visible Resource Discovery panel.

Each result states:
- source;
- discovery state;
- manifest provenance;
- freshness requirement.

## Approved source order

```text
current lesson        future adapter slot
current course        future adapter slot
current school        future adapter slot
Khaemenes Academy     connected
ARSHIF                 connected
PLERA Search           connected outer research layer
```

## Safety rules

- audience/role gates cannot be bypassed;
- preference-gated resources remain gated;
- sensitive preferences are not inferred;
- dynamic resources retain freshness requirements;
- discovered resources are not automatically verified;
- live public manifest reads use no credentials;
- snapshot fallback keeps the application local-first.

## Provider

Still:

```text
activeProvider: local-placeholder
remote.enabled: false
```

## Cache

```text
naib-shell-v1.2.0
```
