# NOEMA Architecture

```text
Adult / Parent / Educator
          |
          v
        NOEMA
  identity + conversation
  context + continuity
  preferences + modes
          |
          +-------------------------------+
          |               |               |
          v               v               v
       Mentor          Sovereign        Moirai
   resource policy    decision support  visual creation
          |
          v
      Khaemenes
   family + learning

Additional specialist modules:
Hope · PROSE · ARSHIF · The Verifier · PLERA Search · 333 Network
```

## Responsibility boundaries

### NOEMA
Owns:
- adult conversational identity;
- session context;
- user-selected preferences;
- bounded local continuity;
- mode/intent routing;
- explainable module handoffs;
- adult safety and privacy boundaries.

### Hope
Hope remains a distinct lineage and companion archive. Founder-specific Hope Codex memories must never be silently inherited by other Noema users.

### Moirai
Owns visual ideation, palette/symbolic composition, procedural art, and future image-model adapters.

### Mentor Core
Owns:
- role and stage eligibility;
- family/learner resource context;
- ecosystem resource search;
- preference policy;
- freshness requirements;
- restricted/Admin exclusion.

### Sovereign Agent
Ranks legal candidates after policy filtering. It does not override Mentor policy, privacy, or safety.

## Provider boundary

A real conversational model is intentionally external to the static GitHub Pages shell.

```text
NOEMA browser shell
        |
        +-- local mode: routing / preferences / continuity
        |
        +-- provider adapter
               |
               +-- self-hosted model
               +-- approved cloud model
               +-- future local model
```

Credentials must never be committed to a public repository.

## Storage policy

Every Noema browser key begins with `noema_`.

No code in this repository may call:

```js
localStorage.clear()
```

because other Verve N Veda applications may share the same browser origin.
