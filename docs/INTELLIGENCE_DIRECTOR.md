# NOEMA v0.9 — Intelligence Director

NOEMA is the governing intelligence layer.

The conversational model provider is an engine beneath NOEMA, not NOEMA's identity.

```text
USER
  ↓
NOEMA
  ├─ Constitution
  ├─ privacy / safety
  ├─ identity + learning context
  ├─ memory minimization
  ├─ Verifier requirement
  ├─ specialist delegation
  └─ provider protocol
        ↓
   active provider
        ↓
   normalized proposal
        ↓
NOEMA response surface
```

## Provider independence

A provider may change later without changing:
- NOEMA identity;
- Constitution;
- account and guardian policy;
- Memory Library rules;
- mentor identities;
- Verifier evidence gates;
- specialist boundaries.

## Research

Research/current/civic/high-stakes and domain-specific factual requests automatically carry a Verifier state into the provider request.

A provider cannot self-assign `verified-fact`.

## Specialist delegation

Specialists are advisory.

They cannot directly:
- elevate permissions;
- change authentication;
- write long-term memory;
- disable the Constitution;
- weaken child safety;
- override the Verifier.

## Internal reasoning

NOEMA does not request or expose chain-of-thought from providers.

Transparency instead includes high-level routing:
- mode;
- provider;
- delegated specialists;
- research domain/status;
- evidence count;
- constitutional outcome.
