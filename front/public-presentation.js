const PUBLIC_NAME = "NAIB";

const PUBLIC_TEXT_REPLACEMENTS = [
  [/NOEMA's verified-fact gate/gi, "the internal verified-fact gate"],
  [/NOEMA's Memory Library/gi, "NAIB's Memory Library"],
  [/NOEMA Constitution/gi, "Constitution"],
  [/NOEMA governs routing/gi, "Internal governance manages routing"],
  [/Admin:\s*NOEMA/gi, "Governance: active"],
  [/NOEMA local/gi, "NAIB local"],
  [/Saved explicitly in NOEMA Memory Library/gi, "Saved explicitly in NAIB Memory Library"],
  [/The name you want Noema to use/gi, "The name you want NAIB to use"],
  [/NOEMA, Mathematics, Campaign site/gi, "NAIB, Mathematics, Campaign site"],
  [/\bNoema\b/g, "NAIB"],
  [/\bNOEMA\b/g, "Internal Governance"]
];

export function sanitizePublicText(value = "") {
  return PUBLIC_TEXT_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value)
  );
}

function ensurePublicStyles() {
  if (document.querySelector('link[data-naib-public-styles]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../styles/naib-public.css", import.meta.url).href;
  link.dataset.naibPublicStyles = "true";
  document.head.appendChild(link);
}

function updateStaticPublicCopy() {
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.content = "NAIB — Public Intelligence Director for conversation, learning, research, creativity, mentors, verification, and specialist coordination across the Verve N Veda ecosystem.";
  }

  const ticker = document.querySelector(".ticker");
  ticker?.setAttribute("aria-label", "NAIB ecosystem ticker");

  const intro = document.querySelector(".hero .intro");
  if (intro) {
    intro.textContent = "Conversation, learning, research, creative direction, persistent mentors, and specialist coordination through one unified public intelligence.";
  }

  const heroEnter = document.querySelector(".hero-enter");
  const workspace = document.querySelector("main.shell");
  if (workspace) workspace.id = "naib-workspace";
  if (heroEnter) heroEnter.setAttribute("href", "#naib-workspace");

  document.querySelector("#modes")?.setAttribute("aria-label", "NAIB modes");

  const displayName = document.querySelector("#enrollDisplayName");
  if (displayName) displayName.placeholder = "The name you want NAIB to use";

  const projectTitle = document.querySelector("#projectTitle");
  if (projectTitle) projectTitle.placeholder = "NAIB, Mathematics, Campaign site…";

  const memoryIntro = document.querySelector("#memoryHeading")?.parentElement?.querySelector("p");
  if (memoryIntro) {
    memoryIntro.textContent = "Conversation does not automatically become long-term memory. Only items explicitly saved here enter NAIB's Memory Library.";
  }
}

function prepareProcessDisclosure() {
  const panel = document.querySelector("#intelligencePlan");
  if (!panel || panel.tagName === "DETAILS") return;

  const details = document.createElement("details");
  details.id = panel.id;
  details.className = panel.className;
  details.hidden = panel.hidden;
  details.setAttribute("aria-label", "NAIB process details");

  const head = panel.querySelector(".plan-head");
  const summary = document.createElement("summary");
  summary.className = "plan-head";

  if (head) {
    while (head.firstChild) summary.appendChild(head.firstChild);
    head.remove();
  } else {
    summary.innerHTML = '<strong>Process details</strong><span id="planSummary">0 tasks</span>';
  }

  const title = summary.querySelector("strong");
  if (title) title.textContent = "Process details";

  details.appendChild(summary);
  while (panel.firstChild) details.appendChild(panel.firstChild);
  panel.replaceWith(details);
}

function prepareModuleDisclosure() {
  const modules = document.querySelector("aside#modules");
  if (!modules) return;

  const shell = document.createElement("aside");
  shell.className = "module-shell";
  shell.setAttribute("aria-label", "Optional system and specialist details");

  const details = document.createElement("details");
  details.className = "module-disclosure";
  details.id = "moduleDisclosure";

  const summary = document.createElement("summary");
  summary.innerHTML = '<span>System &amp; specialist details</span><small>Optional</small>';

  const content = document.createElement("div");
  content.className = "modules";
  content.id = "modules";

  details.append(summary, content);
  shell.appendChild(details);
  modules.replaceWith(shell);
}

function shouldSkipTextNode(node) {
  const parent = node.parentElement;
  return !parent || ["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(parent.tagName);
}

function sanitizeTextNode(node) {
  if (shouldSkipTextNode(node)) return;
  const next = sanitizePublicText(node.nodeValue || "");
  if (next !== node.nodeValue) node.nodeValue = next;
}

function sanitizeElementAttributes(element) {
  if (!(element instanceof Element)) return;
  for (const name of ["aria-label", "title", "placeholder", "content"]) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name) || "";
    const next = sanitizePublicText(current);
    if (next !== current) element.setAttribute(name, next);
  }
}

function sanitizeTree(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    sanitizeTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) sanitizeElementAttributes(root);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) sanitizeTextNode(node);
    else sanitizeElementAttributes(node);
    node = walker.nextNode();
  }
}

function collapseResponseDiagnostics() {
  const response = document.querySelector("#response");
  if (!response) return;

  const trace = [...response.children].find(node => node.classList?.contains("response-trace"));
  if (!trace) return;

  const meta = [...response.children].find(node => node.classList?.contains("meta"));
  const details = document.createElement("details");
  details.className = "response-details";

  const summary = document.createElement("summary");
  summary.textContent = "Response details";
  details.appendChild(summary);

  response.insertBefore(details, meta || trace);
  if (meta) details.appendChild(meta);
  details.appendChild(trace);
}

function protectBrowserPrompts() {
  if (window.__naibPublicPromptBoundary) return;
  window.__naibPublicPromptBoundary = true;

  const originalConfirm = window.confirm.bind(window);
  window.confirm = message => originalConfirm(sanitizePublicText(message));
}

function observePublicSurface() {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) sanitizeTree(node);
    }
    collapseResponseDiagnostics();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

export function activatePublicPresentation() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  ensurePublicStyles();
  updateStaticPublicCopy();
  prepareProcessDisclosure();
  prepareModuleDisclosure();
  sanitizeTree(document.body);
  protectBrowserPrompts();
  collapseResponseDiagnostics();
  observePublicSurface();

  document.documentElement.dataset.publicIdentity = PUBLIC_NAME;
}

activatePublicPresentation();
