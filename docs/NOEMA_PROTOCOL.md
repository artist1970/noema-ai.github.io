# NOEMA Provider Protocol 1.0

The protocol separates stable NOEMA governance from replaceable model engines.

## Request

```text
protocol
protocolVersion
requestId
sessionId
message
noema
context
research
delegation
safety
responseContract
```

## Context minimization

Provider context excludes:
- person ID;
- account ID;
- mentor ID;
- relationship ID;
- birth month/year;
- avatar skin tone;
- hair;
- eyes;
- avatar appearance generally.

Only relevant learning context, bounded mentor behavior, active project summary, limited relevant memories and recent continuity are eligible.

Credential-like memories are excluded again during envelope construction.

## Research contract

The provider receives:

```text
required
domain
status
verifiedLabelAllowed
missingRequiredLanes
```

This allows a provider to help research while remaining subordinate to The Verifier.
