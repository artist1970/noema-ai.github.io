import { LearningFederation } from "./learning-federation.js";
import { NAIBInternalCloud } from "../storage/internal-cloud-instance.js";
import { EcosystemNetworkCatalog, ECOSYSTEM_NETWORK_CATALOG } from "./ecosystem-network-catalog.js";
import { discoverCatalogResources } from "./network-catalog-discovery.js";
import { rankFederatedResources } from "./resource-ranker.js";
import { groupResources } from "./resource-groups.js";

function currentInfoRequested(query = "", mode = "personal") {
  return mode === "research" ||
    /\b(current|latest|today|now|news|recent|updated|fresh|jobs?|market)\b/i.test(String(query || ""));
}

function identityKey(resource = {}) {
  const source = String(resource.sourceId || "").toLowerCase();
  const title = String(resource.title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (source && title) return `${source}|${title}`;
  return String(resource.url || resource.id || "").toLowerCase().replace(/\/+$/, "");
}

function mergeDiscoveryRecords(baseResults = [], networkResults = []) {
  const merged = new Map();

  // The generated network registry usually outranks packaged snapshots because
  // it is rebuilt from current source manifests every six hours.
  for (const resource of networkResults) {
    const key = identityKey(resource);
    if (key) merged.set(key, resource);
  }

  // A directly refreshed source manifest is the freshest source-owned record
  // and therefore takes precedence over the generated network copy.
  for (const resource of baseResults) {
    const key = identityKey(resource);
    if (!key) continue;
    const existing = merged.get(key);
    if (!existing || resource.manifestProvenance === "live-source-manifest") {
      merged.set(key, resource);
    }
  }

  return [...merged.values()];
}

export class ResourceDirector extends LearningFederation {
  constructor(options = {}) {
    super(options);
    this.cloud = options.cloud || NAIBInternalCloud;
    this.cloudReady = this.cloud.initialize().catch(error => ({
      ok: false,
      error: String(error?.message || error)
    }));

    this.networkCatalog = options.networkCatalog || new EcosystemNetworkCatalog({
      fetchImpl: options.fetchImpl,
      cloud: this.cloud
    });
    this.networkReady = this.networkCatalog.initialize().catch(error => ({
      error: String(error?.message || error)
    }));
  }

  async cacheFederationInventory(reason = "refresh") {
    await this.cloudReady;
    const cachedAt = new Date().toISOString();
    const saved = [];

    for (const [sourceId, loader] of this.loaders.entries()) {
      const current = loader.get();
      const result = await this.cloud.put(
        "federation-cache",
        `source/${sourceId}`,
        {
          sourceId,
          cachedAt,
          reason,
          manifest: current.manifest,
          provenance: current.provenance
        },
        {
          metadata: {
            sourceId,
            reason,
            resourceCount: current.manifest?.resources?.length || 0,
            provenance: current.provenance?.mode || "unknown"
          }
        }
      );
      saved.push(result.record);
    }

    const networkStatus = this.networkCatalog.status();

    await this.cloud.put(
      "federation-cache",
      "index/latest",
      {
        cachedAt,
        reason,
        graph: this.graph.status(),
        sources: this.sourceStatus(),
        networkCatalog: networkStatus
      },
      {
        metadata: {
          kind: "federation-index",
          sourceCount: saved.length,
          networkResourceCount: networkStatus.resourceCount,
          networkRepositoryCount: networkStatus.repositoryCount,
          reason
        }
      }
    );

    return {
      ok: true,
      cachedAt,
      count: saved.length,
      networkCatalog: networkStatus
    };
  }

  async refresh(options = {}) {
    await Promise.all([this.cloudReady, this.networkReady]);

    const [sourceResult, networkStatus] = await Promise.all([
      super.refresh(options),
      this.networkCatalog.refresh({
        allowNetwork: options.allowNetwork !== false,
        timeoutMs: Math.max(2500, Number(options.timeoutMs) || 4500),
        force: options.forceNetworkCatalog === true
      })
    ]);

    try { await this.cacheFederationInventory("refresh"); } catch {}

    return [
      ...sourceResult,
      {
        sourceId: ECOSYSTEM_NETWORK_CATALOG.id,
        sourceKind: "generated-network-catalog",
        resourceCount: networkStatus.resourceCount,
        repositoryCount: networkStatus.repositoryCount,
        ...networkStatus.provenance
      }
    ];
  }

  discover(options = {}) {
    const requestedLimit = Math.max(1, Math.min(30, Number(options.maxResults) || 14));
    const workingLimit = Math.max(30, requestedLimit * 3);

    const base = super.discover({ ...options, maxResults: workingLimit });
    const networkStatus = this.networkCatalog.status();
    const catalogRecords = this.networkCatalog.records().map(resource => ({
      ...resource,
      catalogMode: networkStatus.provenance.mode,
      catalogGeneratedAt: networkStatus.generatedAt,
      catalogRefreshedAt: networkStatus.provenance.refreshedAt
    }));

    const network = discoverCatalogResources(catalogRecords, {
      ...options,
      maxResults: Math.min(60, workingLimit * 2)
    });

    const merged = mergeDiscoveryRecords(base.results, network.results);
    const learningContext = base.learningContext;
    const ranked = rankFederatedResources(merged, {
      query: options.query || "",
      mode: options.mode || "personal",
      currentSchoolSourceId: learningContext.currentSchoolSourceId,
      favoriteSubject: learningContext.favoriteSubject,
      currentInfoRequested: currentInfoRequested(options.query || "", options.mode || "personal")
    });
    const results = ranked.slice(0, requestedLimit);

    const networkSourceStatus = {
      id: ECOSYSTEM_NETWORK_CATALOG.id,
      resourceCount: networkStatus.resourceCount,
      repositoryCount: networkStatus.repositoryCount,
      sourceKind: "generated-network-catalog",
      provenance: networkStatus.provenance
    };

    return {
      ...base,
      results,
      groups: groupResources(results, learningContext.currentSchoolSourceId),
      coverage: this.graph.coverageForQuery(options.query || "", results),
      withheldCount: base.withheldCount + network.withheldCount,
      withheld: [...base.withheld, ...network.withheld],
      sourceStatus: [...base.sourceStatus, networkSourceStatus],
      networkCatalog: networkStatus,
      hierarchy: [
        "explicit-current-lesson",
        "explicit-current-course",
        "current-khaemenes-school",
        "khaemenes-academy",
        "assessment-engine-network-catalog",
        "approved-learning-extensions",
        "educational-games",
        "arshif-archive-extension",
        "plera-outer-research"
      ],
      hierarchyNote:
        "Direct live school manifests remain authoritative for current coursework. " +
        "The Assessment Engine network catalog expands discovery across manifested Verve N Veda repositories and is cached in NAIB Internal Cloud. " +
        "Generated catalog entries remain subject to audience, role, preference, freshness, educational-game, and Verifier rules."
    };
  }

  async storageStatus() {
    await this.cloudReady;
    return this.cloud.status();
  }

  async cachedFederationIndex() {
    await this.cloudReady;
    return this.cloud.get("federation-cache", "index/latest");
  }

  networkStatus() {
    return this.networkCatalog.status();
  }
}
