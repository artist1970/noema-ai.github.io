/*
  NOEMA Module Registry
  Compatibility layer backed by the canonical specialist registry.

  Purpose:
  - keep older NOEMA callers that import MODULES/getModule/listModules working;
  - stop duplicating specialist identity, role, authority, and canonical URL data;
  - preserve legacy runtime module URLs only where they are still operational seams.

  Canonical specialist truth lives in:
    ../specialists/specialist-registry.js
*/

import {
  SPECIALISTS
} from "../specialists/specialist-registry.js";

const LEGACY_RUNTIME_SEAMS = Object.freeze({
  mentor: Object.freeze({
    kind: "es-module",
    moduleUrl: "https://vervenveda.com/assessment-engine/mentor/index.js"
  }),
  sovereign: Object.freeze({
    kind: "es-module",
    moduleUrl: "https://vervenveda.com/assessment-engine/agents/core/sovereign-agent.js"
  }),
  hope: Object.freeze({
    kind: "external-app"
  }),
  moirai: Object.freeze({
    kind: "external-app"
  }),
  prose: Object.freeze({
    kind: "ecosystem-resource"
  }),
  arshif: Object.freeze({
    kind: "ecosystem-resource"
  }),
  verifier: Object.freeze({
    kind: "ecosystem-resource"
  }),
  pleraSearch: Object.freeze({
    kind: "ecosystem-resource"
  }),
  network333: Object.freeze({
    kind: "ecosystem-resource"
  })
});

const MODULE_TO_SPECIALIST = Object.freeze({
  hope: "hope",
  moirai: "moirai",
  mentor: "mentor",
  sovereign: "sovereign",
  prose: "prose",
  arshif: "arshif",
  verifier: "verifier",
  pleraSearch: "pleraSearch",
  network333: "network333"
});

function buildModule(moduleKey, specialistKey) {
  const specialist = SPECIALISTS[specialistKey];
  if (!specialist) {
    throw new Error(
      `NOEMA module registry could not resolve specialist "${specialistKey}".`
    );
  }

  const legacy = LEGACY_RUNTIME_SEAMS[moduleKey] || {};

  const module = {
    id: specialist.id,
    label: specialist.label,
    category: specialist.category,
    purpose:
      specialist.notes ||
      (Array.isArray(specialist.purposes)
        ? specialist.purposes.join(", ")
        : ""),
    kind:
      legacy.kind ||
      (specialist.canExecuteLocally
        ? "local-specialist"
        : "ecosystem-resource"),

    state: specialist.state,
    authority: specialist.authority,

    searchTags: Array.isArray(specialist.purposes)
      ? [...specialist.purposes]
      : [],

    requiresFreshness:
      specialist.id === "verifier" ||
      specialist.id === "plera-search",

    requiresAccountAwareness:
      specialist.requiresAccount === true,

    requiresExplicitRequest:
      specialist.requiresExplicitRequest === true
  };

  if (specialist.url) {
    module.url = specialist.url;
  }

  if (legacy.moduleUrl) {
    module.moduleUrl = legacy.moduleUrl;
  }

  return Object.freeze(module);
}

export const MODULES = Object.freeze(
  Object.fromEntries(
    Object.entries(MODULE_TO_SPECIALIST).map(
      ([moduleKey, specialistKey]) => [
        moduleKey,
        buildModule(moduleKey, specialistKey)
      ]
    )
  )
);

export function getModule(id) {
  if (!id) return null;

  if (MODULES[id]) {
    return MODULES[id];
  }

  return (
    Object.values(MODULES).find(
      module => module.id === id
    ) || null
  );
}

export function listModules(ids = Object.keys(MODULES)) {
  return ids
    .map(getModule)
    .filter(Boolean);
}
