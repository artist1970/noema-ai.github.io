# Federation Provenance

There are two source provenance classes.

## Source-owned manifest

The repository publishes `mentor-manifest.json`.

Runtime can make a best-effort HTTPS refresh and use:

```text
live-source-manifest
```

If that fails:

```text
source-manifest-snapshot-fallback
```

## NOEMA-approved inventory snapshot

The repository does not currently publish a mentor manifest.

NOEMA packages a curated inventory based on verified live repository paths.

Provenance:

```text
admin-approved-inventory-snapshot
```

This distinction is permanent in the runtime and visible to the user.

An administrative inventory may classify a verified file path conservatively, but it may not claim the source repository published metadata it did not publish.
