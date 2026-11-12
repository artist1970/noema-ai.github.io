# NOEMA / NAIB identity and mentor routing boundary

Source review: 2026-11-12. The public VNV gateway at `vervenveda/vervenveda.github.io/index.html` identifies NAIB's four public roles: **Understand → Organize → Study → Preserve**, and routes visitors to approved doors. It does **not** expose the protected private Chancellor or confer administrative account access.

**NOEMA is Chancellor of the AI mentors and governs their roles. NAIB is her second-in-command and AI mentor Administrator.** The latter administers, coordinates, and presents specialist routes under NOEMA. Approved specialists retain independent teaching identities, and their references are not automatically commissioned AI backends.

The pure routing pilot `delegation/mentor-discovery-v1.mjs` examines the 13 shared public identities in NAIB's registry and Creative Spark's public roster. The frozen roster snapshot is limited to names, public URLs, and trust labels; it carries Creative Spark's blob SHA for editorial re-verification, but is not a live GitHub synchronization. NAIB and NOEMA are not specialty-routing destinations. Their public front doors remain distinct.

Only Eiren and Moirai have separately verified *handoff references*, not live-model adapters. Other mentors may be **discovered** but no prompt or private context is transferred. Overlapping subjects require user selection; missing age/guardian context, unsafe input, registry mismatch, and unauthorized destinations fail closed. Hope requires explicit adult selection. KlasaiPeer remains behind separate guardian adoption controls.

No code in this phase changes the VNV homepage, student records, live mentor pages, NOEMA governance runtime, STOS, ADIT, private CORE, or account authorization. The test supplies fictional questions and checks that it produces no execution, persistent memory, automatic truth claims, or privileged identity.

Run: `node --test tests/mentor-discovery-v1.test.mjs`. Full suite: `npm test`.

**Next:** audited source/knowledge lookup, user-consented topic handoff, validated laNGgwij broker, review-gated AIPCore feedback.
