# NOEMA v0.9 — Intelligence Director

This package is a **full merged repository**.

Upload the contents into:

`artist1970/noema-ai.github.io`

preserving all folders.

## Major new systems

```text
config/provider-config.js

conversation/
  message-schema.js
  session-engine.js
  context-envelope.js

providers/
  noema-protocol.js
  provider-registry.js
  http-provider.js
  provider-response-normalizer.js

core/
  intelligence-director.js

research/
  research-trigger.js

delegation/
  delegation-engine.js

voice/
  speech-output.js
  push-to-talk.js
  voice-controller.js

transparency/
  provider-trace.js
  intelligence-trace.js

styles/
  noema-conversation.css
```

## Important replacements

```text
index.html
app/noema-app.js
core/noema-core.js
permissions/capability-ledger.js
providers/provider-interface.js
providers/local-placeholder.js
service-worker.js
manifest.webmanifest
package.json
README.md
```

## Current provider state

The secure remote provider remains OFF.

```text
activeProvider: local-placeholder
remote.enabled: false
```

No API key or credential is required.

## What works now

- NOEMA Intelligence Director owns the conversation route.
- Provider-independent request protocol.
- Minimized provider context.
- Transient session engine.
- Automatic Verifier requirement for research/current/civic/high-stakes/domain factual requests.
- Bounded specialist delegation.
- Provider response normalization.
- Provider cannot change permissions or memory.
- Secure future HTTP provider seam.
- Optional browser read-aloud.
- Explicit push-to-talk speech recognition where supported.
- Transcript review before sending.
- No background listening.
- No microphone audio storage.
- Service-worker cache: `noema-shell-v0.9.0`.

## After upload

Verify:
1. `NOEMA / v0.9` displays.
2. ordinary conversation shows `Local fallback`.
3. a research question shows a Verifier status.
4. `Push to talk` is visible and does not auto-send.
5. service worker contains `noema-shell-v0.9.0`.
6. `VALIDATION.json` reports all tests passed.
