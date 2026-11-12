# NOEMA → NAIB consent-scoped mentor teaching handoff (pilot v1)

Date: November 12, 2026. Source-only library, **not deployed**, not
an STOS terminal, not connected to public mentor conversations.

## Why this is separate from Mentor Council

\`mentor-council/coordinator.mjs\` is a multi-mentor group-room primitive
that forwards the last eight turns to invited *authenticated* adapters
during a deliberate authorized group question. Its semantics are not
appropriate for automatic transfer between a learner's private mentor
conversations. We therefore **leave the Council untouched**.

The separate \`ConsentedMentorHandoffPilot\` sends no prior turns,
student records, student IDs, device IDs, profiles or raw chat text.
It transfers an **approved objective ID and public-facing label** only
after the following steps:

1. Trusted host authorizes a *propose* operation for a specific
   authenticated principal and returns a validated audience: child,
   student or adult. Unknown age is denied.
2. NAIB provides an explicit preview with source, destination and one
   curated objective; no transfer happens yet.
3. A separate **trusted host consent verifier** checks actual user
   confirmation. For minors a separately trusted guardian verifier
   also approves. Front-end checkbox values, API request booleans,
   forged receipts and localStorage must never be accepted as proof.
4. The scope is one time only and expires within five minutes.
   Permission is rechecked before release; a request can be revoked
   before release.
5. Release returns a *review-only in-process envelope*, not a network
   dispatch. Public-route references are not an authenticated live AI
   interface. A future authenticated recipient has to independently
   validate both envelope and session authority.

The v1 approved source is Archaemenes, with limited educational
objectives directed toward Zelle, Eiren, Pierre or Moirai. These
destinations were chosen as a **fictional route example**, not a
claim that their public chatboxes have live cross-mentor APIs.
Only Eiren/Moirai have previously reviewed *handoff references*;
Zelle/Pierre remain discovery-only in this pilot.

NOEMA remains Chancellor; NAIB is second-in-command Administrator.
NOEMA's governance does not mean public page JavaScript gets system
authority. Neither the source nor recipient receives a private
history, person ID, guardianship credentials or permission to modify
grades. No AIPCore private lexicon or student cloud is accessed.

## Limitations before any production usage

The injectees \`authorize\`, \`verifyConsent\`, and \`verifyGuardian\`
must be backed by a **separately authenticated, audited host**.
Local synthetic callbacks used for regression testing do not establish
that such a service currently exists. The returned
\`consentHostCallbackPassed\` describes the local callback result,
not cryptographic attestation or a legal consent receipt.

The current component does not persist a consent ledger, send packets
to any mentor, or independently authenticate recipient hosts.
Released in-memory copies cannot be recalled; revocation applies to
requests **prior to release**. For a real deployment, add a server
consent authority, recipient identity verification, revocation and
audit receipts, family controls, replay prevention across processes,
and privacy/age reviews.

Test with:
\`node --test tests/consented-mentor-handoff-v1.test.mjs\`
