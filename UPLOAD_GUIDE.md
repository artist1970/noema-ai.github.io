# NOEMA v0.8 — The Verifier Agent

Upload into:

`artist1970/noema-ai.github.io`

preserving folders.

## New

```text
research/
  fact-status.js
  claim-analyzer.js
  ecosystem-evidence-registry.js
  source-policy.js
  source-independence.js
  evidence-matrix.js
  verification-task-handler.js
  verification-plan.js
  verifier-session-store.js
  verifier-agent.js

adapters/
  research-provider-interface.js

styles/
  noema-verifier.css

docs/
  VERIFIER_AGENT_ARCHITECTURE.md
  EVIDENCE_LANES.md
  INTERNATIONAL_SOURCE_POLICY.md
  DOMAIN_VERIFICATION_STANDARDS.md
  TASK_HANDLER_LINEAGE.md

tests/
  claim-analyzer.test.mjs
  source-independence.test.mjs
  evidence-matrix.test.mjs
  verification-plan.test.mjs
  verification-task-handler.test.mjs
  verifier-agent.test.mjs
```

## Replace

```text
index.html
app/noema-app.js
core/noema-core.js
permissions/capability-ledger.js
service-worker.js
```

## v0.8 behavior

- Adds a `Verifier Agent` button.
- Any factual claim can become a local verification session.
- Detects research domain.
- Builds a transparent evidence plan.
- ARSHIF and Khaemenes context checks are required before the verified-fact gate.
- Searches are modeled through ARSHIF, Khaemenes, Verifier, Medicament, Firmament and Solanar lanes.
- Tracks primary/secondary/tertiary source level.
- Tracks supporting/opposing/contextual/insufficient evidence.
- Groups repeated sources by underlying independence family.
- Requires freshness for time-sensitive claims.
- Requires active contradiction search.
- Gives conservative evidence statuses rather than binary "true/false".
- `research.override-verdict-gates` is blocked.
- Live retrieval remains unconfigured until a secure research provider/server exists.
- Cache: `noema-shell-v0.8.0`.
