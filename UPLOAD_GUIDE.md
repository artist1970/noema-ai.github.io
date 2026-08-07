# NOEMA v0.6 — Identity + Enrollment Spine

Upload this package into:

`artist1970/noema-ai.github.io`

preserving folders.

## New files

```text
config/server-config.js
config/server-contract.example.json

identity/person-schema.js
identity/guardian-policy.js
identity/enrollment-store.js
identity/mentor-relationship-store.js

adapters/account-server-client.js
sync/identity-sync.js

schemas/enrollment-contract.schema.json
schemas/mentor-relationship.schema.json

styles/noema-enrollment.css

docs/IDENTITY_ENROLLMENT_PROTOCOL.md
docs/FUTURE_SECURE_SERVER_HOST.md
docs/ACCOUNT_SERVER_API_CONTRACT.md

tests/enrollment.test.mjs
tests/server-config.test.mjs
tests/account-server-client.test.mjs
tests/mentor-relationship.test.mjs
tests/context-enrollment.test.mjs
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

## What v0.6 does now

- Adds local Identity & Enrollment UI.
- Stores month/year instead of requiring a full birthday.
- Separates age from grade and learning stage.
- Establishes default child / teen / adult enrollment pathways.
- Creates a local person → mentor relationship ID.
- Adds learner interests and favorite subject.
- Keeps avatar appearance out of learner inference.
- Adds a future HTTPS account-server configuration seam.
- Adds a remote account client designed for secure server-side sessions.
- Stores no browser password or authentication token.
- Keeps cross-device sync disabled until a real secure server exists.
- Advances service-worker cache to `noema-shell-v0.6.0`.
