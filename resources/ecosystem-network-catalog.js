import { normalizeResourceRecord } from "./resource-manifest.js";
import { federationSource } from "./federation-source-registry.js";

export const ECOSYSTEM_NETWORK_CATALOG = Object.freeze({
  id: "verve.ecosystem-network-catalog",
  version: 1,
  ttlMs: 15 * 60 * 1000,
  resourcesUrls: [
    "https://vervenveda.com/assessment-engine/mentor/registry/ecosystem-resources.json",
    "https://raw.githubusercontent.com/vervenveda/vervenveda.github.io/main/assessment-engine/mentor/registry/ecosystem-resources.json"
  ],
  repositoriesUrls: [
    "https://vervenveda.com/assessment-engine/mentor/registry/ecosystem-repositories.json",
    "https://raw.githubusercontent.com/vervenveda/vervenveda.github.io/main/assessment-engine/mentor/registry/ecosystem-repositories.json"
  ]
});

const ASSESSMENT_ENGINE_ANCHORS = Object.freeze([
  {
    id: "verve.assessment-engine.home",
    title: "Universal Assessment, Simulation, and Problem-Solving Engine",
    description: "Reusable Khaemenes and Verve N Veda assessment, simulation, evidence, and problem-solving infrastructure.",
    url: "https://vervenveda.com/assessment-engine/",
    sourceId: "verve.assessment-engine",
    repository: "vervenveda/vervenveda.github.io",
    classification: "educational",
    audiences: ["elementary", "middle", "high", "higher-learning", "adult", "parent"],
    roles: ["student", "parent", "educator"],
    domains: ["assessment", "education", "problem-solving", "simulation"],
    skills: ["assessment", "problem-solving", "evidence-review", "adaptive-learning"],
    tags: ["assessment-engine", "simulation", "evidence", "monte-carlo", "minimax"],
    resourceType: "tool",
    learningValue: "supplemental",
    curricularWeight: "supplemental",
    mentorEligible: true,
    recommendable: true,
    featured: true,
    requiresFreshnessCheck: false,
    dynamicContent: false,
    requiresPreferenceMatch: [],
    requiresAccountAwareness: false,
    sensitiveTopics: [],
    externalInformation: false,
    sourcePriority: 24,
    policyTags: ["trusted-network-anchor"]
  }
]);

function nowIso() {
  return new Date().toISOString();
}

function safeText(value, max = 1200) {
  return String(value ?? "").trim().slice(0, max);
}

function safeArray(value, max = 40) {
  return Array.isArray(value)
    ? value.slice(0, max).map(item => safeText(item, 220)).filter(Boolean)
    : [];
}

function priorityFor(resource = {}) {
  const direct = federationSource(resource.sourceId);
  if (direct) return Number(direct.priority) || 50;

  const classification = safeText(resource.classification, 120).toLowerCase();
  if (classification === "educational") return 38;
  if (classification === "creative-cultural") return 44;
  if (classification === "professional-practical") return 50;
  if (classification === "research-information") return 56;
  if (classification === "wellness") return 58;
  if (classification === "civic") return 60;
  if (classification === "campaign") return 72;
  if (classification === "admin-only" || classification === "restricted") return 90;
  return 78;
}

function tierFor(resource = {}) {
  const direct = federationSource(resource.sourceId);
  if (direct) return direct.tier;

  const classification = safeText(resource.classification, 120).toLowerCase();
  if (classification === "educational") return "network-learning-extension";
  if (classification === "creative-cultural") return "network-creative-extension";
  if (classification === "research-information") return "network-research-extension";
  if (classification === "professional-practical") return "network-practical-extension";
  if (classification === "wellness") return "network-wellness-extension";
  if (classification === "civic") return "network-civic-extension";
  return "network-extension";
}

export function normalizeCatalogResource(resource = {}) {
  const sourceId = safeText(resource.sourceId || `github:${resource.repository || "unknown"}`, 180);
  const sourceName = safeText(resource.repository || sourceId || "Ecosystem resource", 240);
  const classification = safeText(resource.classification || "unclassified", 120);

  const normalized = normalizeResourceRecord(resource, {
    sourceId,
    name: sourceName,
    classification
  });

  return {
    ...normalized,
    sourceId,
    sourceName,
    sourceClassification: classification,
    repository: safeText(resource.repository, 320),
    recommendable: resource.recommendable === true,
    explicitAdultOptIn: resource.explicitAdultOptIn === true,
    requiresAccountAwareness: resource.requiresAccountAwareness === true,
    sensitiveTopics: safeArray(resource.sensitiveTopics, 20),
    externalInformation: resource.externalInformation === true,
    sourcePriority: Number.isFinite(Number(resource.sourcePriority)) && Number(resource.sourcePriority) > 0
      ? Math.max(priorityFor(resource), Number(resource.sourcePriority))
      : priorityFor(resource),
    sourceTier: tierFor(resource),
    freshnessWindowMinutes: Number.isFinite(Number(resource.freshnessWindowMinutes))
      ? Math.max(1, Number(resource.freshnessWindowMinutes))
      : null,
    contentType: safeText(resource.contentType, 120),
    policyTags: safeArray(resource.policyTags, 24),
    requiresExplicitQuery: resource.requiresExplicitQuery === true,
    manifestPath: safeText(resource.manifestPath || "mentor-manifest.json", 220),
    catalogProvenance: "assessment-engine-generated-registry"
  };
}

function validResourceRegistry(value) {
  return Boolean(value && Number(value.version) >= 2 && Array.isArray(value.resources));
}

function validRepositoryRegistry(value) {
  return Boolean(value && Number(value.version) >= 2 && Array.isArray(value.repositories));
}

async function fetchJson(url, { fetchImpl = globalThis.fetch, timeoutMs = 4500 } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetch-unavailable");
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json" },
      ...(controller ? { signal: controller.signal } : {})
    });
    if (!response.ok) throw new Error(`catalog-http-${response.status}`);
    return await response.json();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchFirst(urls = [], options = {}) {
  const errors = [];
  for (const url of urls) {
    try {
      return { value: await fetchJson(url, options), url };
    } catch (error) {
      errors.push(`${url}: ${String(error?.message || error)}`);
    }
  }
  throw new Error(errors.join(" | ").slice(0, 1200) || "catalog-fetch-failed");
}

function uniqueRecords(records = []) {
  const seen = new Set();
  const output = [];
  for (const record of records) {
    const url = safeText(record.url, 1800).replace(/\/+$/, "").toLowerCase();
    const key = url || safeText(record.id, 220).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(record);
  }
  return output;
}

export class EcosystemNetworkCatalog {
  constructor({
    fetchImpl = globalThis.fetch,
    cloud = null,
    ttlMs = ECOSYSTEM_NETWORK_CATALOG.ttlMs,
    now = () => Date.now()
  } = {}) {
    this.fetchImpl = fetchImpl;
    this.cloud = cloud;
    this.ttlMs = Math.max(60_000, Number(ttlMs) || ECOSYSTEM_NETWORK_CATALOG.ttlMs);
    this.now = now;
    this.initialized = false;
    this.current = {
      resources: uniqueRecords(ASSESSMENT_ENGINE_ANCHORS.map(normalizeCatalogResource)),
      repositories: [],
      generatedAt: null
    };
    this.provenance = {
      id: ECOSYSTEM_NETWORK_CATALOG.id,
      mode: "built-in-anchor",
      refreshed: false,
      refreshedAt: null,
      sourceGeneratedAt: null,
      resourcesUrl: "",
      repositoriesUrl: "",
      error: null
    };
  }

  async initialize() {
    if (this.initialized) return this.status();
    this.initialized = true;

    if (!this.cloud) return this.status();

    try {
      const [resourceCache, repositoryCache] = await Promise.all([
        this.cloud.get("federation-cache", "network-catalog/resources"),
        this.cloud.get("federation-cache", "network-catalog/repositories")
      ]);

      const resourceRaw = resourceCache?.value?.registry;
      const repositoryRaw = repositoryCache?.value?.registry;

      if (validResourceRegistry(resourceRaw)) {
        this.current.resources = uniqueRecords([
          ...ASSESSMENT_ENGINE_ANCHORS.map(normalizeCatalogResource),
          ...resourceRaw.resources.map(normalizeCatalogResource)
        ]);
        this.current.generatedAt = resourceRaw.generatedAt || null;
      }

      if (validRepositoryRegistry(repositoryRaw)) {
        this.current.repositories = repositoryRaw.repositories.slice(0, 5000);
      }

      if (validResourceRegistry(resourceRaw) || validRepositoryRegistry(repositoryRaw)) {
        this.provenance = {
          ...this.provenance,
          mode: "internal-cloud-cache",
          refreshed: false,
          refreshedAt: resourceCache?.value?.cachedAt || repositoryCache?.value?.cachedAt || null,
          sourceGeneratedAt: resourceRaw?.generatedAt || repositoryRaw?.generatedAt || null,
          error: null
        };
      }
    } catch (error) {
      this.provenance.error = String(error?.message || error).slice(0, 500);
    }

    return this.status();
  }

  freshEnough() {
    if (!this.provenance.refreshedAt) return false;
    const stamp = Date.parse(this.provenance.refreshedAt);
    return Number.isFinite(stamp) && (this.now() - stamp) < this.ttlMs;
  }

  async refresh({ allowNetwork = true, timeoutMs = 4500, force = false } = {}) {
    await this.initialize();

    if (!allowNetwork) return this.status();
    if (!force && this.freshEnough()) return this.status();

    try {
      const [resourceResult, repositoryResult] = await Promise.all([
        fetchFirst(ECOSYSTEM_NETWORK_CATALOG.resourcesUrls, { fetchImpl: this.fetchImpl, timeoutMs }),
        fetchFirst(ECOSYSTEM_NETWORK_CATALOG.repositoriesUrls, { fetchImpl: this.fetchImpl, timeoutMs })
      ]);

      if (!validResourceRegistry(resourceResult.value)) throw new Error("invalid-ecosystem-resource-registry");
      if (!validRepositoryRegistry(repositoryResult.value)) throw new Error("invalid-ecosystem-repository-registry");

      const refreshedAt = nowIso();
      this.current = {
        resources: uniqueRecords([
          ...ASSESSMENT_ENGINE_ANCHORS.map(normalizeCatalogResource),
          ...resourceResult.value.resources.map(normalizeCatalogResource)
        ]),
        repositories: repositoryResult.value.repositories.slice(0, 5000),
        generatedAt: resourceResult.value.generatedAt || repositoryResult.value.generatedAt || null
      };

      this.provenance = {
        id: ECOSYSTEM_NETWORK_CATALOG.id,
        mode: "live-assessment-engine-registry",
        refreshed: true,
        refreshedAt,
        sourceGeneratedAt: this.current.generatedAt,
        resourcesUrl: resourceResult.url,
        repositoriesUrl: repositoryResult.url,
        error: null
      };

      if (this.cloud) {
        await Promise.all([
          this.cloud.put(
            "federation-cache",
            "network-catalog/resources",
            { cachedAt: refreshedAt, registry: resourceResult.value },
            {
              metadata: {
                kind: "ecosystem-resource-registry",
                generatedAt: resourceResult.value.generatedAt || "",
                count: resourceResult.value.resources.length
              }
            }
          ),
          this.cloud.put(
            "federation-cache",
            "network-catalog/repositories",
            { cachedAt: refreshedAt, registry: repositoryResult.value },
            {
              metadata: {
                kind: "ecosystem-repository-registry",
                generatedAt: repositoryResult.value.generatedAt || "",
                count: repositoryResult.value.repositories.length
              }
            }
          )
        ]);
      }
    } catch (error) {
      this.provenance = {
        ...this.provenance,
        mode: this.current.resources.length > ASSESSMENT_ENGINE_ANCHORS.length
          ? "internal-cloud-cache-fallback"
          : "built-in-anchor-fallback",
        refreshed: false,
        error: String(error?.message || error).slice(0, 800)
      };
    }

    return this.status();
  }

  records({ recommendableOnly = true } = {}) {
    return this.current.resources
      .filter(resource => !recommendableOnly || resource.recommendable === true)
      .map(resource => ({ ...resource }));
  }

  repositories() {
    return this.current.repositories.map(repository => ({ ...repository }));
  }

  status() {
    const repositories = this.current.repositories;
    const manifested = repositories.filter(item => item.discoveryStatus === "manifested").length;
    const recommendable = repositories.filter(item => item.recommendable === true).length;

    return {
      id: ECOSYSTEM_NETWORK_CATALOG.id,
      version: ECOSYSTEM_NETWORK_CATALOG.version,
      resourceCount: this.current.resources.length,
      repositoryCount: repositories.length,
      manifestedRepositoryCount: manifested,
      recommendableRepositoryCount: recommendable,
      generatedAt: this.current.generatedAt,
      provenance: { ...this.provenance }
    };
  }
}
