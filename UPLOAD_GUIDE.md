# NOEMA Repository Upload Guide

Target:

`artist1970/noema-ai.github.io`

Upload the **contents** of this ZIP to the repository root while preserving folders.

Expected root:

```text
noema-ai.github.io/
├── index.html
├── README.md
├── mentor-manifest.json
├── manifest.webmanifest
├── service-worker.js
├── package.json
├── adapters/
├── app/
├── config/
├── core/
├── docs/
├── memory/
├── providers/
├── safety/
├── styles/
└── tests/
```

## After upload

1. Confirm GitHub Pages is publishing from `main` / root.
2. Open the site and verify the NOEMA shell loads.
3. In `vervenveda/vervenveda.github.io`, run:
   `Actions → Mentor Resource Index → Run workflow → main`
4. The central Mentor registry should then discover the root `mentor-manifest.json`.

## Important

This package contains:
- no API keys;
- no passwords;
- no Founder-specific Hope Codex memories;
- no hidden provider credential;
- no `localStorage.clear()`.

The conversational provider remains intentionally unconnected in v0.2.
