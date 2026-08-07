# Resource Provenance

Every discovered resource carries:

- source ID;
- source name;
- source classification;
- manifest provenance;
- manifest refresh time when live;
- audience;
- role;
- domains;
- skills;
- tags;
- preference requirements;
- freshness requirements;
- discovery state;
- `verified: false`.

`verified: false` is intentional.

A resource manifest can establish that the resource exists and is approved for discovery.

It cannot establish that every factual statement inside the resource is verified.
