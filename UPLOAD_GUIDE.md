# NAIB v1.1 — Public Intelligence / NOEMA Administration

This package is a full merged repository.

Upload all contents into the existing repository for now:

`artist1970/noema-ai.github.io`

Do not rename the repository yet.

The public interface will become NAIB while NOEMA remains the administrative intelligence behind it.

## New files

```text
front/
  naib-identity.js
  naib-facade.js
  public-boundary.js

docs/
  NAIB_NOEMA_ARCHITECTURE.md
  PUBLIC_IDENTITY_BOUNDARY.md
  IDENTITY_LINEAGE.md
```

## Important behavior

Existing `noema_*` localStorage keys are intentionally preserved.

Do not delete or rename them.

They now represent NOEMA-managed administrative state.

## Public identity

```text
NAIB
Public Intelligence Director
```

## Administrative identity

```text
NOEMA
Administrative Intelligence
```

## Cache

```text
naib-shell-v1.1.0
```

## Current provider state

Still unchanged:

```text
activeProvider: local-placeholder
remote.enabled: false
```

No server, API key, or account infrastructure is required for this release.
