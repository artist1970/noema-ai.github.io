# Phase 2 Validation Checklist

- [ ] Phase 1 `config/mentor-registry.json` still exists unchanged.
- [ ] Phase 1 `adapters/eiren-adapter.js` still exists unchanged.
- [ ] Existing `adapters/moirai-adapter.js` is unchanged.
- [ ] Replace `config/naib-public-contract.js` with the Phase 2 version.
- [ ] Add `delegation/mentor-router.js`.
- [ ] Confirm Noema is identified only as private Chancellor.
- [ ] Confirm NAIB is identified as Administrator.
- [ ] Confirm only Eiren and Moirai are routable in Phase 2.
- [ ] Confirm ambiguous cross-domain requests do not silently choose a mentor.
- [ ] Confirm unknown mentors return `not-routable`.
- [ ] Confirm no CORE content, credentials, tokens, or secrets are present.
- [ ] Leave `delegation/delegation-engine.js` unchanged.
- [ ] Leave `directory/ecosystem.json` unchanged.
- [ ] Audit Moirai's existing `createMoiraiHandoff` signature before live invocation.
- [ ] After verification, inspect delegation-engine callers before Phase 3 integration.
