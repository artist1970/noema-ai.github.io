# Educational Game Policy

A game is not educational merely because it lives in an educational ecosystem.

To enter ordinary educational ranking, a game must have an established learning objective.

Accepted objective provenance:

```text
explicit-resource-metadata
source-supplied-skills
```

Examples already supported by source-owned manifests include:

- Elementary Geometry Game — geometry / spatial reasoning
- Arabic Memory Game — Arabic / memory practice

A game with no established objective is marked:

```text
learningValue: unknown
eligibleForEducationalRanking: false
```

It is withheld from ordinary learning recommendations.

If the user explicitly asks for a game and the title/topic matches, an unknown-value game may be shown as a game, but it is not promoted as curriculum.

By default:

```text
direct course > practice > supplemental educational game
```

A direct matching course remains higher priority unless the user asks for game/practice activity.
