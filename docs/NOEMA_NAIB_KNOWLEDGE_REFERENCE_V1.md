# NOEMA / NAIB approved public knowledge reference boundary v1

As of November 12, 2026: **review-only**, not connected to live NAIB,
NOEMA, mentor chatboxes, AIPCore private lexicon, student data, or STOS.

The nine source-owned public Q&A banks remain hosted in their individual
mentor repositories, with editorial review and static federation in
\`artist1970/creative-spark.github.io\`. These contain **1,354 published
records** across nine source owners. The **900 Code Capsule drafts** are
still unpublished and MUST NOT be merged or independently approved by
this receiving boundary.

A separately injected \`creative-spark-approved-knowledge-reference-v1\`
packet is checked against
\`config/creative-spark-approved-knowledge-sources.v1.json\`,
a pinned **public-only source metadata snapshot** of Creative Spark's
canonical nine-source manifest (source Git blob SHA recorded).

\`acceptKnowledgeReference\` requires an aligned NOEMA→NAIB governance
contract, recognized mentor requester, explicit offline review flag,
adult audience, exact source URL, exact normalized question matching,
valid publication metadata and **all privilege/verification flags false**.
It does not itself authenticate senders or verify a hash signature: the
catalog source SHA is a *snapshot identifier*, not a cryptographic proof
of an incoming packet. Runtime authentication and transport require
a separately reviewed and commissioned host.

The returned credited reference includes source mentor, source document,
source record ID, text and limited \`source-statement\` classification.
It never reports independent truth verification or completed per-use
human adjudication. The answer is not automatically dispatched to an AI
mentor, learner or visitor.

The pilot blocks children and teens until youth-suitability evidence
exists for individual answers. Hope and Aurora sources additionally
require independent specialist safety review.

**Hierarchy remains: Chancellor NOEMA governs all AI mentors; NAIB is
second-in-command and administrator.** Neither public gateway is a
privileged administration client. No student learning records, STOS
terminal, private CORE, AIPCore's 2,468-word lexicon or public landing
page was changed.

Test: \`node --test tests/mentor-knowledge-reference-v1.test.mjs\`.
The existing \`npm test\` suite includes the new tests automatically.
