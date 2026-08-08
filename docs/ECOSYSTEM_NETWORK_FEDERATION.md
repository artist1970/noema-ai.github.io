# NAIB Ecosystem Network Federation

## Purpose

NAIB uses the Verve N Veda Assessment Engine's generated Mentor registries as the network discovery feed for the wider Verve N Veda / Khaemenes ecosystem.

This avoids creating a second repository crawler in the public NAIB application.

## Authoritative discovery flow

```text
Public GitHub repositories
        ↓
mentor-manifest.json in each participating repository
        ↓
Verve N Veda Assessment Engine scheduled indexer
        ↓
ecosystem-repositories.json + ecosystem-resources.json
        ↓
NAIB EcosystemNetworkCatalog
        ↓
NAIB Internal Cloud / federation-cache
        ↓
NOEMA audience + role + preference + freshness + game + Verifier policy
        ↓
Resource Director ranking
        ↓
NAIB Resource Discovery
```

## Assessment Engine source

The upstream generated registries live at:

- `/assessment-engine/mentor/registry/ecosystem-repositories.json`
- `/assessment-engine/mentor/registry/ecosystem-resources.json`

The Assessment Engine workflow rebuilds those registries from the configured network accounts. NAIB consumes the generated output; it does not use a GitHub credential and it does not crawl private repositories.

## Network accounts

The Assessment Engine currently indexes the configured public repositories for:

- `vervenveda`
- `JenniferPearl2028`
- `artist1970`

The account list remains owned by the Assessment Engine discovery subsystem.

## Why NAIB still keeps direct school manifests

NAIB continues to load the direct manifests for Khaemenes Preschool, Kindergarten, Elementary, Middle, High, Higher Learning, Linguistics, Academy, ARSHIF, and PLERA Search.

A direct live source manifest is considered fresher than a generated network copy. The network catalog is therefore an expansion layer, not a replacement for direct current-school context.

Precedence:

1. direct live source manifest;
2. Assessment Engine generated network registry;
3. packaged source snapshot;
4. built-in trusted anchor.

## Internal Cloud caching

The network registries are cached in the dependency-free NAIB Internal Cloud under `federation-cache`:

- `network-catalog/resources`
- `network-catalog/repositories`
- the ordinary federation `index/latest`

The cache lets NAIB retain a large catalog without putting the registry in `localStorage`.

The browser controls storage quota. The cache is local to that browser profile until a future authenticated account service is deliberately connected.

## Refresh behavior

The Assessment Engine rebuilds its catalog on its own schedule. NAIB uses a short local refresh TTL so it does not re-download the registry for every request.

If live retrieval fails:

1. NAIB retains the last valid Internal Cloud catalog;
2. if no cache exists, NAIB retains its built-in Assessment Engine anchor;
3. NAIB reports provenance rather than pretending the network refresh succeeded.

## Recommendation boundaries

A repository being discovered does not automatically make it recommendable.

NAIB only considers catalog resources that the upstream manifest/index has marked recommendable, and then applies its own controls:

- learner audience;
- role eligibility;
- explicit preference gates;
- explicit-query requirements;
- adult opt-in boundaries;
- educational-game objective requirements;
- health / medical Verifier rules;
- dynamic-information freshness rules;
- normal current-school and course ranking.

Discovery is navigation, not factual verification.

## Assessment Engine anchor

The central Assessment Engine is also registered as a trusted network anchor because the main `vervenveda.github.io` repository does not currently publish a root `mentor-manifest.json`.

Anchor:

`https://vervenveda.com/assessment-engine/`

The anchor is categorized as educational infrastructure / tool. If the root repository later publishes a matching source-owned manifest entry, the live or generated manifested resource should supersede the anchor through normal de-duplication.

## No external dependency requirement

The federation layer uses only:

- browser `fetch`;
- native JavaScript;
- the existing NAIB Internal Cloud (IndexedDB);
- public static JSON generated inside the Verve N Veda repository network.

No search SDK, cloud database SDK, analytics package, crawler library, or third-party educational platform is required.
