# Daily Spark Task Handler → Verifier Workflow

NOEMA v0.8 adapts a useful principle already present in ProReSources Daily Spark:

> Every eligible task is scored/handled transparently rather than through hidden random priority.

For verification, this becomes a dependency-aware research task chain.

Example:

```text
Define claim
   ↓
Search ARSHIF / Khaemenes context
   ↓
Find primary evidence
   ↓
Find independent corroboration
   ├── Medicament if medical
   ├── Firmament if legal
   ├── Solanar if atmospheric
   └── International Verifier lane if current/contested
   ↓
Check freshness
   ↓
Search for contradiction
   ↓
Assign evidence status
```

The handler records status and dependencies so a final verdict cannot silently skip required lanes.
