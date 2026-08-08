import test from "node:test";
import assert from "node:assert/strict";
import { InternalCloud } from "../storage/internal-cloud.js";
import {
  EcosystemNetworkCatalog,
  normalizeCatalogResource
} from "../resources/ecosystem-network-catalog.js";

const resourceRegistry = {
  version: 2,
  generatedAt: "2026-08-08T13:55:13Z",
  resources: [
    {
      id: "vervenveda.khaemenes_elementary.github.io.number-forge",
      title: "Number Forge Game",
      description: "Build numbers with hundreds, tens, and ones.",
      url: "https://vervenveda.com/Khaemenes_Elementary.github.io/games/number-forge/",
      sourceId: "khaemenes.elementary",
      repository: "vervenveda/Khaemenes_Elementary.github.io",
      classification: "educational",
      audiences: ["elementary"],
      roles: ["student", "parent", "educator"],
      domains: ["mathematics"],
      skills: ["place-value", "regrouping"],
      tags: ["game", "math"],
      mentorEligible: true,
      recommendable: true
    }
  ]
};

const repositoryRegistry = {
  version: 2,
  generatedAt: "2026-08-08T13:55:13Z",
  accounts: ["vervenveda", "JenniferPearl2028", "artist1970"],
  repositories: [
    {
      fullName: "vervenveda/Khaemenes_Elementary.github.io",
      discoveryStatus: "manifested",
      recommendable: true
    }
  ]
};

function successfulFetch(url) {
  const body = String(url).includes("ecosystem-resources")
    ? resourceRegistry
    : repositoryRegistry;
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => body
  });
}

test("catalog normalization preserves source learning evidence", () => {
  const record = normalizeCatalogResource(resourceRegistry.resources[0]);
  assert.equal(record.sourceId, "khaemenes.elementary");
  assert.equal(record.resourceType, "game");
  assert.equal(record.learningValue, "supplemental");
  assert.deepEqual(record.learningObjectives, ["place-value", "regrouping"]);
  assert.equal(record.recommendable, true);
});

test("network catalog refreshes and caches Assessment Engine registries", async () => {
  const cloud = new InternalCloud({ indexedDBImpl: null, navigatorImpl: null });
  await cloud.initialize();

  const catalog = new EcosystemNetworkCatalog({
    fetchImpl: successfulFetch,
    cloud,
    ttlMs: 60_000
  });

  const status = await catalog.refresh({ force: true });
  assert.equal(status.provenance.mode, "live-assessment-engine-registry");
  assert.equal(status.repositoryCount, 1);
  assert.ok(status.resourceCount >= 2);

  const records = catalog.records();
  assert.ok(records.some(item => item.title === "Number Forge Game"));
  assert.ok(records.some(item => item.sourceId === "verve.assessment-engine"));

  const cachedResources = await cloud.get("federation-cache", "network-catalog/resources");
  const cachedRepositories = await cloud.get("federation-cache", "network-catalog/repositories");
  assert.equal(cachedResources.value.registry.version, 2);
  assert.equal(cachedRepositories.value.registry.version, 2);
});
