# NAIB v1.2 — Specialist Runtime & Resource Discovery

v1.2 turns approved ecosystem handoffs into a bounded resource-discovery runtime.

## Connected sources

The first connected manifest sources are:

1. Khaemenes Academy
2. ARSHIF Archives
3. PLERA Search

The source manifests are treated as the authority for resource eligibility metadata.

## Runtime states

```text
EXECUTED
DISCOVERED
HANDOFF
UNAVAILABLE
```

`EXECUTED` means a local adapter actually ran.

`DISCOVERED` means an eligible resource was found in an approved manifest.

`HANDOFF` means NAIB prepared or displayed a destination but the external application did not execute inside NAIB.

`UNAVAILABLE` means the required capability or connection was not available.

## Manifest freshness

NAIB packages validated manifest snapshots so the runtime works without a server.

When a relevant request is processed, NOEMA makes a best-effort read of the approved public HTTPS manifests.

If live manifest retrieval succeeds, provenance is `live-manifest`.

If it fails, the runtime falls back to the packaged snapshot and says so.

This is resource-metadata freshness, not factual claim verification.
