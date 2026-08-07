import { NoemaCore } from "../core/noema-core.js";
import { listModes, getMode } from "../core/mode-router.js";
import { LocalPlaceholderProvider } from "../providers/local-placeholder.js";

const provider = new LocalPlaceholderProvider();
const noema = new NoemaCore({ role: "adult", provider });

const modesEl = document.querySelector("#modes");
const hintEl = document.querySelector("#modeHint");
const modulesEl = document.querySelector("#modules");
const messageEl = document.querySelector("#message");
const responseEl = document.querySelector("#response");
const routeBtn = document.querySelector("#routeBtn");
const clearBtn = document.querySelector("#clearBtn");
const eraseBtn = document.querySelector("#eraseBtn");

let activeMode = noema.preferences.load().preferences.lastMode || "personal";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function renderModes() {
  modesEl.innerHTML = "";
  for (const mode of listModes()) {
    const button = document.createElement("button");
    button.className = `mode${mode.id === activeMode ? " active" : ""}`;
    button.textContent = mode.label;
    button.addEventListener("click", () => {
      activeMode = mode.id;
      noema.preferences.patch({ lastMode: activeMode });
      renderModes();
      renderMode(activeMode);
    });
    modesEl.appendChild(button);
  }
}

function renderMode(id) {
  hintEl.textContent = getMode(id).hint;
}

function renderModules(route) {
  modulesEl.innerHTML = route.modules.map(module => `
    <article class="card module-card">
      <div class="module-title">${escapeHtml(module.label)}</div>
      <div class="module-purpose">${escapeHtml(module.purpose)}</div>
      ${module.url
        ? `<a class="module-link" target="_blank" rel="noopener" href="${module.url}">Open specialist module ↗</a>`
        : ""
      }
    </article>
  `).join("");
}

async function handleRoute() {
  const route = noema.route(messageEl.value, { mode: activeMode });
  renderModules(route);

  const result = await provider.respond({ route });

  const safety = route.safety.highStakes
    ? `<div class="notice"><strong>Care boundary:</strong> This request may involve ${route.safety.categories.join(", ")} information. Current or qualified sources may be required.</div>`
    : "";

  const privacy = route.privacy.sensitive
    ? `<div class="notice"><strong>Privacy:</strong> ${escapeHtml(route.privacy.recommendation)}</div>`
    : "";

  responseEl.innerHTML = `
    ${safety}
    ${privacy}
    <strong>${escapeHtml(result.text)}</strong>
    <div class="meta">Provider: ${escapeHtml(result.provider)} · Model-generated response: ${result.generatedByModel ? "yes" : "no"}</div>
  `;

  noema.rememberExchange({
    user: route.message,
    assistant: result.text,
    mode: route.mode.id
  });
}

routeBtn.addEventListener("click", handleRoute);

clearBtn.addEventListener("click", () => {
  messageEl.value = "";
  responseEl.innerHTML =
    "Noema's static shell is ready. A conversational model provider has not been connected yet.";
});

eraseBtn.addEventListener("click", () => {
  noema.clearNoemaData();
  activeMode = "personal";
  renderModes();
  renderMode(activeMode);
  responseEl.innerHTML =
    "NOEMA local preferences and continuity were cleared. Other applications were not affected.";
});

renderModes();
renderMode(activeMode);
handleRoute();
