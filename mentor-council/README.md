# Mentor Council — governed orchestration kernel (v1)

**Status:** isolated **source implementation** with dependency-injected mentor adapters and fictional unit tests. **NOT DEPLOYED, NOT CONNECTED TO ADMIN, NOT A MODEL HOST.**

## Relationship to the existing systems

- **Public admin panel:** `vervenveda/vervenveda.github.io/admin/2index.html` + `admin/mentor-council.js`, currently an inactive admin-page add-on with approved public Q&A group replies.
- **NOEMA:** protected Chancellor and administrative policies. This directory is a separately namespaced library; existing NOEMA runtime imports, gates, public NAIB identity, and routes are untouched.
- **NAIB:** administrator and presenter of specialist conversations, without elevated privileges.
- **ADIT / STOS:** any future network or STOS call requires a separately approved, authenticated bridge and governed capability contract. The coordinator has no built-in network or mutation path.
- **AIPCore:** potential future bounded relevance signals, not execution authority.
- **CORE identities:** source-of-truth role definitions; these documents are not automatically loaded by the coordinator.
- **Specialists:** adapters must be separately implemented and authenticated. NOEMA's existing mentor router currently provides verified *handoff* support for Eiren and Moirai; a handoff is **not** a live generative chat adapter.

## Working API

`new MentorCouncil({authorize, adapters, maxTurns, timeoutMs})`

The caller must inject a real authorization callback; there is no default permit. A mentor adapter is an async function receiving a bounded prompt and recent session turns and returning:

```json
{
  "status": "ok",
  "kind": "live-mentor",
  "content": "Human-readable response",
  "sources": ["verified-document-id-or-public-url"],
  "runtimeId": "registered-runtime-instance"
}
```

Alternatively `kind: "approved-public-reference"` indicates a curated source, **not** a live model reply. The coordinator labels each mentor, distinguishes unavailable adapters and adapter errors, prevents cross-principal room reuse, and keeps sessions **in process only** until explicitly ended. It does not write memory, invoke model APIs or persist transcripts.

```js
const council = new MentorCouncil({
  authorize: async ({principal,operation}) => /* replace with verified server-side authorization */,
  adapters: {auren: async request => /* verified private mentor runtime */ }
});
await council.begin({principal:"authenticated-owner-id",sessionId:"unique-room-id",invited:["auren","eiren"]});
await council.ask({principal:"authenticated-owner-id",sessionId:"unique-room-id",message:"Explore a historical artwork"});
```

The snippet is **illustrative only**. Without an actual verified authentication function and adapter, the council must not be exposed to users.

## Current limits and release holds

- `authorize` must be backed by trusted server-side authentication/authorization; a static admin page and browser-local passcode do not satisfy this condition.
- `principal` is caller-provided in this module. Trust its value **only** after a server authentication boundary; never bind it directly to an untrusted HTTP request field.
- No network transport, signed requests, cross-device state, persistent memory, model execution, or private source retrieval has been installed.
- Adapter isolation relies on trusted injected implementations. Adapters need individual privacy validation, source allowlists, user consent, and timeouts. The timeout reports failure but does not abort an underlying adapter operation without additional cancellation design.
- The coordinator currently passes the latest eight prior turns at the start of a question to each invited mentor. The first turn is user-led; mentors do not automatically converse indefinitely. A later reviewed version may add explicit rounds, turn quotas and cancellation.
- The initial content filter is defense in depth only. Proper privacy classification, sensitive data screening, and authorization must be implemented upstream.
- In-process rooms are ephemeral and not encrypted vaults. Do not run this module with sensitive records until the host's memory protections and retention controls have been reviewed.
- No production deployment or live runtime certification is claimed. Run `node --test mentor-council/coordinator.test.mjs` and review the results. Do not change STOS, ADIT, CORE, or NOEMA live routes merely to make this test pass.

## Safe next integration sequence

1. Confirm which trusted service owns administrator login and group-session authorization.
2. Bind one **verified** mentor runtime to one adapter and test authentic response metadata, timeout, cancellation, and refusal.
3. Extend to two mentors with independent contexts, citations, no cross-mentor private data leakage, and explicit invitation.
4. Wire `admin/mentor-council.js` to a narrowly scoped authenticated endpoint **only after** the service is commissioned and the formerly resting admin entrance is deliberately and safely reopened through the normal authorized process.
5. Record approval and operational receipts for every step. Keep the curated public Q&A mode as a graceful fallback.

**Principles:** Shared network, distinct voices. Proposal is not execution. Private archival originals remain private. Human authority is final.
