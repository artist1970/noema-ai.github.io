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

const enrollmentBtn = document.querySelector("#enrollmentBtn");
const enrollmentDrawer = document.querySelector("#enrollmentDrawer");
const enrollmentClose = document.querySelector("#enrollmentClose");
const enrollmentForm = document.querySelector("#enrollmentForm");
const enrollDisplayName = document.querySelector("#enrollDisplayName");
const enrollBirthMonth = document.querySelector("#enrollBirthMonth");
const enrollBirthYear = document.querySelector("#enrollBirthYear");
const enrollEducationSetting = document.querySelector("#enrollEducationSetting");
const enrollGrade = document.querySelector("#enrollGrade");
const enrollLearningStage = document.querySelector("#enrollLearningStage");
const enrollFavoriteSubject = document.querySelector("#enrollFavoriteSubject");
const enrollInterests = document.querySelector("#enrollInterests");
const enrollmentMessage = document.querySelector("#enrollmentMessage");
const identitySummary = document.querySelector("#identitySummary");
const serverStatusPill = document.querySelector("#serverStatusPill");

const memoryBtn = document.querySelector("#memoryBtn");
const memoryDrawer = document.querySelector("#memoryDrawer");
const memoryClose = document.querySelector("#memoryClose");
const memoryList = document.querySelector("#memoryList");
const memoryCount = document.querySelector("#memoryCount");
const memoryForm = document.querySelector("#memoryForm");
const memoryTitle = document.querySelector("#memoryTitle");
const memoryContent = document.querySelector("#memoryContent");
const memoryKind = document.querySelector("#memoryKind");
const memoryScope = document.querySelector("#memoryScope");
const memoryTags = document.querySelector("#memoryTags");
const memoryStatus = document.querySelector("#memoryStatus");
const exportMemoryBtn = document.querySelector("#exportMemoryBtn");

const projectForm = document.querySelector("#projectForm");
const projectTitle = document.querySelector("#projectTitle");
const projectSummary = document.querySelector("#projectSummary");
const projectMode = document.querySelector("#projectMode");
const projectList = document.querySelector("#projectList");
const activeProjectLabel = document.querySelector("#activeProjectLabel");

let activeMode = noema.preferences.load().preferences.lastMode || "personal";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
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
  const activeProject = route.context?.project;
  const memoryUsed = route.context?.memory?.relevant || [];

  const contextCard = `
    <article class="card module-card context-card">
      <div class="module-title">Active Context</div>
      <div class="module-purpose">
        ${activeProject
          ? `Project: <strong>${escapeHtml(activeProject.title)}</strong>`
          : "No active project"}
        <br>
        Memory: ${memoryUsed.length} relevant of ${route.context?.memory?.activeCount || 0} retained
      </div>
    </article>
  `;

  const enrollment = route.context?.enrollment;
  const enrollmentCard = `
    <article class="card module-card enrollment-status-card">
      <div class="module-title">Identity & Enrollment</div>
      <div class="module-purpose">
        ${enrollment
          ? `${escapeHtml(enrollment.displayName)} · ${escapeHtml(enrollment.ageBand)}<br>${escapeHtml(enrollment.learning?.gradeLevel || "not-applicable")}`
          : "No local enrollment profile yet"}
      </div>
    </article>
  `;

  const integrity = `
    <article class="card module-card system-integrity">
      <div class="module-title">NOEMA Constitution</div>
      <div class="module-purpose">
        Ethics kernel active · v${escapeHtml(route.ethics.constitutionVersion)}
      </div>
      <div class="integrity-row">
        <span class="integrity-dot ${route.ethics.blocked ? "blocked" : "active"}"></span>
        ${route.ethics.blocked ? "Boundary enforced" : "Active"}
      </div>
    </article>
  `;

  const specialists = route.modules.map(module => `
    <article class="card module-card">
      <div class="module-title">${escapeHtml(module.label)}</div>
      <div class="module-purpose">${escapeHtml(module.purpose)}</div>
      ${module.url
        ? `<a class="module-link" target="_blank" rel="noopener" href="${module.url}">Open specialist module ↗</a>`
        : ""
      }
    </article>
  `).join("");

  modulesEl.innerHTML = enrollmentCard + contextCard + integrity + specialists;
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

  const ethics = route.ethics.needsReview
    ? `<div class="notice constitution-notice"><strong>Constitution:</strong> ${route.ethics.concerns.map(item => escapeHtml(item.message)).join(" ")}</div>`
    : "";

  const recalled = route.context?.memory?.relevant?.length
    ? `<div class="memory-context-note">Context used: ${route.context.memory.relevant.length} explicitly retained memory item${route.context.memory.relevant.length === 1 ? "" : "s"}.</div>`
    : "";

  responseEl.innerHTML = `
    ${safety}
    ${privacy}
    ${ethics}
    <strong>${escapeHtml(result.text)}</strong>
    ${recalled}
    <div class="meta">
      Provider: ${escapeHtml(result.provider)}
      · Model-generated response: ${result.generatedByModel ? "yes" : "no"}
      · Constitution: active v${escapeHtml(route.ethics.constitutionVersion)}
    </div>
  `;

  if (!route.ethics.blocked) {
    noema.rememberExchange({
      user: route.message,
      assistant: result.text,
      mode: route.mode.id
    });
  }
}


function openEnrollment() {
  enrollmentDrawer.hidden = false;
  renderEnrollment();
}

function closeEnrollment() {
  enrollmentDrawer.hidden = true;
}

function selectedInterests() {
  return [...enrollInterests.querySelectorAll('input[type="checkbox"]:checked')]
    .map(input => input.value)
    .slice(0, 8);
}

function renderEnrollment() {
  const status = noema.getEnrollmentStatus();
  const profile = status.profile;
  const relationship = status.mentorRelationship;
  const server = status.sync?.server || {};

  serverStatusPill.textContent = server.enabled ? "Secure host configured" : "Local only";

  if (profile) {
    enrollDisplayName.value = profile.displayName || "";
    enrollBirthMonth.value = profile.birthMonth || "";
    enrollBirthYear.value = profile.birthYear || "";
    enrollEducationSetting.value = profile.learning?.educationSetting || "independent";
    enrollGrade.value = profile.learning?.gradeLevel || "not-applicable";
    enrollLearningStage.value = profile.learning?.learningStage || "";
    enrollFavoriteSubject.value = profile.learning?.favoriteSubject || "not-sure-yet";

    const interestSet = new Set(profile.learning?.interests || []);
    enrollInterests.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = interestSet.has(input.value);
    });
  }

  identitySummary.innerHTML = profile
    ? `
      <div class="identity-summary-box">
        <span>Person</span>
        <strong>${escapeHtml(profile.displayName)}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Enrollment pathway</span>
        <strong>${escapeHtml(profile.accountPathway)}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Learning placement</span>
        <strong>${escapeHtml(profile.learning?.gradeLevel || "not-applicable")}${profile.learning?.learningStage ? ` · ${escapeHtml(profile.learning.learningStage)}` : ""}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Mentor relationship</span>
        <strong>${relationship ? "Persistent local prototype created" : "Created after enrollment"}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Cross-device persistence</span>
        <strong>${server.enabled ? "Server seam configured; authentication still required" : "Not active — local browser only"}</strong>
      </div>
    `
    : `
      <div class="memory-empty">
        Create the local enrollment profile to establish the person → mentor relationship spine.
      </div>
    `;
}

enrollmentForm.addEventListener("submit", event => {
  event.preventDefault();

  const result = noema.saveEnrollment({
    displayName: enrollDisplayName.value,
    birthMonth: Number(enrollBirthMonth.value),
    birthYear: Number(enrollBirthYear.value),
    educationSetting: enrollEducationSetting.value,
    gradeLevel: enrollGrade.value,
    learningStage: enrollLearningStage.value,
    favoriteSubject: enrollFavoriteSubject.value,
    interests: selectedInterests()
  });

  enrollmentMessage.textContent = result.reason;

  if (result.ok) {
    renderEnrollment();
    handleRoute();
  }
});

enrollmentBtn.addEventListener("click", openEnrollment);
enrollmentClose.addEventListener("click", closeEnrollment);
enrollmentDrawer.addEventListener("click", event => {
  if (event.target === enrollmentDrawer) closeEnrollment();
});


function openMemory() {
  memoryDrawer.hidden = false;
  document.body.classList.add("memory-open");
  renderMemoryLibrary();
  renderProjects();
}

function closeMemory() {
  memoryDrawer.hidden = true;
  document.body.classList.remove("memory-open");
}

function renderMemoryLibrary() {
  const items = noema.memory.list({ activeOnly: false }).slice().reverse();
  memoryCount.textContent = `${items.length} retained`;

  if (!items.length) {
    memoryList.innerHTML = `
      <div class="memory-empty">
        Nothing is stored in long-term memory yet. Conversation alone does not create a memory.
      </div>
    `;
    return;
  }

  memoryList.innerHTML = items.map(item => `
    <article class="memory-item" data-memory-id="${escapeHtml(item.id)}">
      <div class="memory-item-head">
        <div>
          <span class="memory-kind">${escapeHtml(item.kind)}</span>
          <strong>${escapeHtml(item.title || "Untitled memory")}</strong>
        </div>
        <span class="memory-scope">${escapeHtml(item.scope)}</span>
      </div>
      <p>${escapeHtml(item.content)}</p>
      <div class="memory-meta">
        Source: ${escapeHtml(item.source?.label || "User")}
        · Updated ${new Date(item.updatedAt).toLocaleString()}
      </div>
      ${item.tags?.length ? `<div class="memory-tags">${item.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <div class="memory-item-actions">
        <button type="button" class="mini-btn edit-memory" data-id="${escapeHtml(item.id)}">Edit</button>
        <button type="button" class="mini-btn delete-memory" data-id="${escapeHtml(item.id)}">Delete</button>
      </div>
    </article>
  `).join("");

  memoryList.querySelectorAll(".delete-memory").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Delete this retained memory?")) return;
      const result = noema.deleteMemory(button.dataset.id);
      memoryStatus.textContent = result.reason;
      renderMemoryLibrary();
      handleRoute();
    });
  });

  memoryList.querySelectorAll(".edit-memory").forEach(button => {
    button.addEventListener("click", () => {
      const item = noema.memory.get(button.dataset.id);
      if (!item) return;
      const next = prompt("Edit this memory:", item.content);
      if (next === null) return;
      const result = noema.updateMemory(item.id, { content: next });
      memoryStatus.textContent = result.reason;
      renderMemoryLibrary();
      handleRoute();
    });
  });
}

memoryForm.addEventListener("submit", event => {
  event.preventDefault();

  const result = noema.saveMemory({
    title: memoryTitle.value,
    content: memoryContent.value,
    kind: memoryKind.value,
    scope: memoryScope.value,
    tags: memoryTags.value.split(",").map(tag => tag.trim()).filter(Boolean),
    source: {
      type: "user-explicit",
      label: "Saved explicitly in NOEMA Memory Library"
    },
    confidence: 1
  });

  memoryStatus.textContent = result.reason;

  if (result.ok) {
    memoryForm.reset();
    memoryScope.value = activeMode;
    renderMemoryLibrary();
    handleRoute();
  }
});

function renderProjects() {
  const projects = noema.projects.list().slice().reverse();
  const active = noema.projects.active();

  activeProjectLabel.textContent = active ? active.title : "No active project";

  if (!projects.length) {
    projectList.innerHTML = `<div class="memory-empty">No persistent project context yet.</div>`;
    return;
  }

  projectList.innerHTML = projects.map(project => `
    <article class="project-item ${active?.id === project.id ? "active" : ""}">
      <div>
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(project.mode)} · ${escapeHtml(project.status)}</span>
      </div>
      <p>${escapeHtml(project.summary || "No summary yet.")}</p>
      <div class="memory-item-actions">
        <button type="button" class="mini-btn activate-project" data-id="${escapeHtml(project.id)}">
          ${active?.id === project.id ? "Active" : "Use context"}
        </button>
        <button type="button" class="mini-btn remove-project" data-id="${escapeHtml(project.id)}">Remove</button>
      </div>
    </article>
  `).join("");

  projectList.querySelectorAll(".activate-project").forEach(button => {
    button.addEventListener("click", () => {
      noema.projects.setActive(button.dataset.id);
      renderProjects();
      handleRoute();
    });
  });

  projectList.querySelectorAll(".remove-project").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Remove this project context?")) return;
      noema.projects.remove(button.dataset.id);
      renderProjects();
      handleRoute();
    });
  });
}

projectForm.addEventListener("submit", event => {
  event.preventDefault();
  noema.projects.create({
    title: projectTitle.value,
    summary: projectSummary.value,
    mode: projectMode.value,
    status: "active"
  });
  projectForm.reset();
  projectMode.value = activeMode;
  renderProjects();
  handleRoute();
});

exportMemoryBtn.addEventListener("click", () => {
  const payload = JSON.stringify(noema.memory.export(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `noema-memory-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

memoryBtn.addEventListener("click", openMemory);
memoryClose.addEventListener("click", closeMemory);
memoryDrawer.addEventListener("click", event => {
  if (event.target === memoryDrawer) closeMemory();
});

routeBtn.addEventListener("click", handleRoute);

clearBtn.addEventListener("click", () => {
  messageEl.value = "";
  responseEl.innerHTML =
    "Noema's local shell is ready. Constitutional policy is active; a conversational model provider has not been connected yet.";
});

eraseBtn.addEventListener("click", () => {
  if (!confirm("Clear all NOEMA local preferences, short-term continuity, long-term Memory Library, and project context on this browser?")) return;
  noema.clearNoemaData();
  activeMode = "personal";
  renderModes();
  renderMode(activeMode);
  renderMemoryLibrary();
  renderProjects();
  renderEnrollment();
  responseEl.innerHTML =
    "NOEMA local preferences, continuity, Memory Library, and project context were cleared. Other applications were not affected.";
});

renderModes();
renderMode(activeMode);
memoryScope.value = activeMode;
projectMode.value = activeMode;
renderMemoryLibrary();
renderProjects();
renderEnrollment();
handleRoute();
