# NAIB Canonical Public Front Migration

## Canonical architecture

```text
Private identity/governance
artist1970/CORE/NAIBCore
        |
        | governs through protected runtime
        v
Internal intelligence runtime
artist1970/noema-ai.github.io
        |
        | sanitized NAIB facade
        v
Canonical public front
artist1970/NAIB.github.io
```

The root of `noema-ai.github.io` is now a neutral navigation gateway. It is not the canonical NAIB interface and it does not present the internal administrative identity as a public personality.

## Files changed by this patch

- `front/naib-identity.js`
- `front/naib-facade.js`
- `front/public-boundary.js`
- `config/naib-public-contract.js`

## Files intentionally retained

- `front/public-presentation.js`
- `app/noema-app.js`
- all internal core, ethics, delegation, provider, memory, identity, verification, avatar, enrollment, and specialist-routing modules

`front/public-presentation.js` remains a **legacy compatibility sanitizer** for any older interface that still uses the internal runtime directly. It is not the canonical public page.

## Safety rules

1. Never fetch `artist1970/CORE/NAIBCore` directly from public browser code.
2. Never place CORE secrets, credentials, tokens, MFA seeds, signing keys, or private governance state in public JavaScript.
3. Do not remove the existing facade until `NAIB.github.io` has demonstrated equivalent public behavior.
4. Internal identity names should not be emitted through the public facade.
5. NAIB remains the public identity.
6. The human remains the final authority.
