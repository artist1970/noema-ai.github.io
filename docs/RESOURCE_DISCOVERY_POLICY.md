# Resource Discovery Policy

## Search hierarchy

```text
current lesson
current course
current school
Khaemenes Academy
approved ecosystem
PLERA outer research
```

v1.2 connects the last three layers.

The first three slots are deliberately reserved for school/course manifests as those repositories are connected later.

## Audience

Resources must match the learner's explicit enrollment audience and role.

Parent-facing tools are not silently reclassified as student resources.

## Preference gates

A resource with `requiresPreferenceMatch` is withheld unless:
- the user explicitly asks for that topic in the current request; or
- an explicitly supplied learner/mentor preference matches.

No religious preference is inferred from appearance, demographics, or unrelated behavior.

## Dynamic content

Resources marked `requiresFreshnessCheck` preserve that label.

Discovery of PLERA Search does not mean current information has been checked.

Search ranking does not become evidence status.
