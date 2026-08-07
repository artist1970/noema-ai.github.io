const KEY = "noema_project_context_v1";
const MAX_PROJECTS = 27;

function resolveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

function clean(value, max = 600) {
  return String(value || "").trim().slice(0, max);
}

export class ProjectContextStore {
  constructor(storage) {
    this.storage = resolveStorage(storage);
    this.state = this.#load();
  }

  #default() {
    return {
      version: 1,
      activeProjectId: null,
      projects: []
    };
  }

  #load() {
    if (!this.storage) return this.#default();
    try {
      const parsed = JSON.parse(this.storage.getItem(KEY) || "null");
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.projects)) return this.#default();
      return {
        version: 1,
        activeProjectId: parsed.activeProjectId || null,
        projects: parsed.projects.slice(-MAX_PROJECTS)
      };
    } catch {
      return this.#default();
    }
  }

  #save() {
    if (!this.storage) return;
    try { this.storage.setItem(KEY, JSON.stringify(this.state)); } catch {}
  }

  create(input = {}) {
    const now = new Date().toISOString();
    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: clean(input.title, 100) || "Untitled Project",
      summary: clean(input.summary, 900),
      mode: clean(input.mode, 40) || "work",
      status: ["active", "paused", "complete"].includes(input.status) ? input.status : "active",
      tags: Array.isArray(input.tags)
        ? [...new Set(input.tags.map(tag => clean(tag, 40).toLowerCase()).filter(Boolean))].slice(0, 12)
        : [],
      createdAt: now,
      updatedAt: now
    };

    this.state.projects.push(project);
    this.state.projects = this.state.projects.slice(-MAX_PROJECTS);
    this.state.activeProjectId = project.id;
    this.#save();
    return { ...project, tags: [...project.tags] };
  }

  update(id, patch = {}) {
    const index = this.state.projects.findIndex(project => project.id === id);
    if (index < 0) return null;

    const current = this.state.projects[index];
    const updated = {
      ...current,
      title: patch.title !== undefined ? clean(patch.title, 100) || current.title : current.title,
      summary: patch.summary !== undefined ? clean(patch.summary, 900) : current.summary,
      mode: patch.mode !== undefined ? clean(patch.mode, 40) || current.mode : current.mode,
      status: ["active", "paused", "complete"].includes(patch.status) ? patch.status : current.status,
      tags: Array.isArray(patch.tags)
        ? [...new Set(patch.tags.map(tag => clean(tag, 40).toLowerCase()).filter(Boolean))].slice(0, 12)
        : current.tags,
      updatedAt: new Date().toISOString()
    };

    this.state.projects[index] = updated;
    this.#save();
    return { ...updated, tags: [...updated.tags] };
  }

  setActive(id) {
    if (id !== null && !this.state.projects.some(project => project.id === id)) return false;
    this.state.activeProjectId = id;
    this.#save();
    return true;
  }

  active() {
    const project = this.state.projects.find(item => item.id === this.state.activeProjectId);
    return project ? { ...project, tags: [...(project.tags || [])] } : null;
  }

  list() {
    return this.state.projects.map(project => ({ ...project, tags: [...(project.tags || [])] }));
  }

  remove(id) {
    const before = this.state.projects.length;
    this.state.projects = this.state.projects.filter(project => project.id !== id);
    if (this.state.activeProjectId === id) this.state.activeProjectId = null;
    this.#save();
    return this.state.projects.length < before;
  }

  reset() {
    this.state = this.#default();
    if (this.storage) {
      try { this.storage.removeItem(KEY); } catch {}
    }
  }
}
