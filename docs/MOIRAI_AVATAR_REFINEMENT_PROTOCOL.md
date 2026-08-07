# NOEMA → Moirai Avatar Refinement Protocol

Status: future seam, not connected in v0.7.

## Purpose

Turn a user-created mentor sketch into a polished illustrated character without discarding the user's design.

## Required inputs

- original sketch strokes;
- locally cleaned strokes;
- sketch ID;
- mentor display name;
- mentor temperament;
- appearance palette;
- explicit source provenance.

## Required constraints

```text
preserveSourceIdentity = true
prohibitUnrelatedReplacement = true
preserveRecognizableSketchFeatures = true
```

Allowed refinement:
- smooth lines;
- clean overlaps;
- improve proportion balance;
- improve color consistency;
- render coherent hair/clothing/materials;
- create a polished character illustration.

Not allowed by default:
- replacing the character with an unrelated generated person;
- inferring the artist's race, psychology, intelligence or ability from the drawing;
- changing account or mentor permissions;
- treating artwork as identity verification.
