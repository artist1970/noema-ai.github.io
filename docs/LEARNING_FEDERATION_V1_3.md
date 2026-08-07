# NAIB v1.3 — Learning Federation & Course Graph

v1.3 expands resource discovery from three ecosystem sources into a learning federation.

## Public / administrative roles

NAIB remains the public intelligence.

NOEMA remains the administrative intelligence that owns the federation, source provenance, audience gates, preference gates, Verifier policy, and specialist authority.

## Search order

```text
explicit current lesson        when indexed
explicit current course        when indexed
current Khaemenes school       connected
Khaemenes Academy              connected
approved learning extensions   connected
educational games              connected with objective gate
ARSHIF archive extension       connected
PLERA outer research           connected
```

## Khaemenes stage sources

Source-owned mentor manifests are connected for:

- Preschool / Crechè
- Kindergarten
- Elementary
- Middle School
- High School
- Higher Learning
- Linguistics / Polyglot
- central Khaemenes Academy

The learner's explicit grade/stage selects the current-school priority source.

The federation does not use age to infer academic ability.

## Learning extensions

The release also includes NOEMA-approved inventory snapshots for repositories that do not currently publish mentor manifests:

- Verve N Veda Finance
- Medicament Hub
- Bazaar Art
- Arcade learning selection

Those records are explicitly labeled `admin-approved-inventory-snapshot`.

They are not represented as source-owned manifests.

## Course graph

The graph creates nodes only for sources and resources actually present in source manifests or approved inventory snapshots.

If the user asks for a unit, week, or lesson that is not indexed, the graph reports a coverage gap.

It does not manufacture a unit or route.
