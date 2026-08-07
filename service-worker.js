const CACHE = "noema-shell-v0.6.0";
const SHELL = [
  "./",
  "./index.html",
  "./styles/noema.css",
  "./styles/noema-ethics.css",
  "./styles/noema-memory.css",
  "./styles/noema-enrollment.css",
  "./app/noema-app.js",
  "./core/noema-core.js",
  "./core/identity.js",
  "./core/persona.js",
  "./core/context-builder.js",
  "./core/conversation-orchestrator.js",
  "./core/mode-router.js",
  "./core/module-registry.js",
  "./memory/preference-store.js",
  "./memory/continuity-store.js",
  "./memory/memory-schema.js",
  "./memory/memory-store.js",
  "./memory/memory-retriever.js",
  "./memory/project-context-store.js",
  "./memory/sensitive-memory-filter.js",
  "./identity/person-schema.js",
  "./identity/guardian-policy.js",
  "./identity/enrollment-store.js",
  "./identity/mentor-relationship-store.js",
  "./config/server-config.js",
  "./adapters/account-server-client.js",
  "./sync/identity-sync.js",
  "./providers/provider-interface.js",
  "./providers/local-placeholder.js",
  "./safety/adult-boundaries.js",
  "./safety/privacy-boundary.js",
  "./ethics/constitution.js",
  "./ethics/ethics-engine.js",
  "./ethics/non-manipulation.js",
  "./permissions/capability-ledger.js",
  "./permissions/action-gate.js",
  "./transparency/route-trace.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
