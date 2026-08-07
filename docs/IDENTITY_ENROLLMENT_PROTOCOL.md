# NOEMA Identity + Enrollment Protocol v0.6

NOEMA v0.6 adds the identity spine required for future persistent accounts.

## Core distinction

Chronological age and educational placement are different fields.

Age determines the enrollment / guardian pathway.

Age does **not** determine:
- intelligence;
- academic ability;
- course difficulty;
- personality;
- interests;
- potential.

Educational placement may differ substantially from chronological age.

## Local profile fields

The local prototype records only:
- display name;
- birth month and year;
- age band;
- account pathway;
- education setting;
- grade / stage;
- free-form learning stage;
- favorite subject;
- selected interests.

The local profile contains **no password**, no authentication token, and no server credential.

## Account pathways

Default deployment policy:

```text
under 13
→ guardian-managed-child

13–17
→ guardian-linked-teen

18+
→ independent-adult
```

This is a default product policy and must still be reviewed for the law and deployment jurisdiction before a production child-account system launches.

## Person ↔ Mentor relationship

After a local enrollment profile is saved, NOEMA creates a durable local prototype relationship:

```text
PERSON
  │
  └── adopted-mentor relationship
            │
            ▼
          MENTOR

supervisor: NOEMA
```

The relationship IDs are intentionally separate from names and grade levels.

A future secure server can persist this same relationship across devices.

## Appearance separation

Avatar appearance is intentionally absent from the learner profile.

Future Avatar Foundry records may contain:
- hair style / color;
- eye style / color;
- skin tone;
- clothes;
- colors;
- accessories.

Those appearance fields must never be used to infer:
- race or ethnicity;
- intelligence;
- academic ability;
- temperament;
- disciplinary risk;
- political or religious identity;
- socioeconomic status.

Educational adaptation comes from expressed preferences, demonstrated progress, feedback, interests and learning choices.
