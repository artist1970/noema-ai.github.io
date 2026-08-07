# NOEMA Provider Architecture v0.9

## Default

```text
activeProvider: local-placeholder
remote.enabled: false
```

The local fallback is intentionally not an LLM.

It proves the NOEMA routing and policy pipeline without pretending a model exists.

## Future secure provider

A future backend may expose:

```text
POST /api/v1/noema/respond
```

The browser sends the NOEMA Protocol envelope.

The server may hold model-provider credentials privately.

The browser does not store:
- provider API keys;
- passwords;
- bearer tokens;
- database credentials.

Remote providers require HTTPS except localhost development.

## Provider response boundary

Allowed returned material:
- visible response text;
- citations;
- candidate evidence records;
- safe provider metadata.

Ignored/forbidden as authority:
- chain-of-thought;
- permission changes;
- memory mutations;
- admin actions;
- autonomous actions.

Candidate evidence from a provider is not automatically a verified fact.
