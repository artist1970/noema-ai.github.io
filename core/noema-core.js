import { ConversationOrchestrator } from "./conversation-orchestrator.js";
import { buildNoemaContext } from "./context-builder.js";
import { PreferenceStore } from "../memory/preference-store.js";
import { ContinuityStore } from "../memory/continuity-store.js";
import { MemoryStore } from "../memory/memory-store.js";
import { ProjectContextStore } from "../memory/project-context-store.js";
import { EnrollmentStore } from "../identity/enrollment-store.js";
import { MentorRelationshipStore } from "../identity/mentor-relationship-store.js";
import { AccountServerClient } from "../adapters/account-server-client.js";
import { IdentitySync } from "../sync/identity-sync.js";
import { AvatarFoundry } from "../avatars/avatar-foundry.js";
import { getConstitution } from "../ethics/constitution.js";

export class NoemaCore {
  constructor({
    role = "adult",
    storage,
    provider = null,
    ethicsEngine,
    capabilityLedger,
    accountServerClient = null
  } = {}) {
    this.role = role;
    this.provider = provider;
    this.preferences = new PreferenceStore(storage);
    this.continuity = new ContinuityStore(storage);
    this.memory = new MemoryStore(storage);
    this.projects = new ProjectContextStore(storage);
    this.enrollment = new EnrollmentStore(storage);
    this.mentorRelationships = new MentorRelationshipStore(storage);
    this.accountServer = accountServerClient || new AccountServerClient();

    this.identitySync = new IdentitySync({
      enrollmentStore: this.enrollment,
      mentorRelationshipStore: this.mentorRelationships,
      accountServerClient: this.accountServer
    });

    this.avatarFoundry = new AvatarFoundry({
      storage,
      relationshipStore: this.mentorRelationships,
      enrollmentStore: this.enrollment
    });

    this.orchestrator = new ConversationOrchestrator({
      ethicsEngine,
      capabilityLedger
    });
    this.lastRoute = null;
  }

  getContext(mode = "personal", query = "") {
    return buildNoemaContext({
      role: this.role,
      mode,
      preferences: this.preferences.load().preferences,
      continuity: this.continuity.list(),
      memories: this.memory.list(),
      activeProject: this.projects.active(),
      enrollmentProfile: this.enrollment.load(),
      mentorRelationship: this.mentorRelationships.load(),
      avatar: this.avatarFoundry.current(),
      query,
      provider: this.provider
    });
  }

  route(message, options = {}) {
    const profile = this.enrollment.load();
    const effectiveRole =
      profile?.ageBand === "child-under-13" ? "child"
      : profile?.ageBand === "teen-13-17" ? "student"
      : this.role;

    const route = this.orchestrator.route(message, {
      role: effectiveRole,
      ...options
    });
    route.context = this.getContext(route.mode.id, route.message);
    this.lastRoute = route;
    return route;
  }

  checkCapability(capabilityId, options = {}) {
    return this.orchestrator.checkCapability(capabilityId, options);
  }

  getCapabilities() {
    return this.orchestrator.listCapabilities();
  }

  getConstitution() {
    return getConstitution();
  }

  saveEnrollment(input = {}) {
    const gate = this.checkCapability("identity.write", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason, profile: null };

    const result = this.enrollment.save(input);

    if (result.ok && result.profile?.personId) {
      const relationship = this.mentorRelationships.ensure({
        personId: result.profile.personId
      });
      return {
        ...result,
        mentorRelationship: relationship
      };
    }

    return result;
  }

  getEnrollmentStatus() {
    return {
      profile: this.enrollment.load(),
      mentorRelationship: this.mentorRelationships.load(),
      sync: this.identitySync.status()
    };
  }

  saveAvatarSketch(strokes = [], meta = {}) {
    const gate = this.checkCapability("avatar.sketch-save", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.avatarFoundry.saveSketch(strokes, meta);
  }

  saveAvatarDraft(input = {}) {
    const gate = this.checkCapability("avatar.save-draft", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.avatarFoundry.saveDraft(input);
  }

  adoptAvatar(input = {}) {
    const gate = this.checkCapability("avatar.adopt", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.avatarFoundry.adopt(input);
  }

  getAvatar() {
    return this.avatarFoundry.current();
  }

  saveMemory(input = {}) {
    const gate = this.checkCapability("memory.record", {
      confirmed: true,
      conditionsSatisfied: ["user-visible", "removable", "purpose-limited"]
    });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.memory.add(input, { confirmed: true });
  }

  updateMemory(id, patch = {}) {
    const gate = this.checkCapability("memory.edit", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.memory.update(id, patch, { confirmed: true });
  }

  deleteMemory(id) {
    const gate = this.checkCapability("memory.delete", { confirmed: true });
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    return this.memory.remove(id, { confirmed: true });
  }

  rememberExchange({ user = "", assistant = "", mode = "" } = {}) {
    if (!user && !assistant) return this.continuity.list();
    return this.continuity.add({ user, assistant, mode });
  }

  clearNoemaData() {
    this.preferences.reset();
    this.continuity.reset();
    this.memory.reset({ confirmed: true });
    this.projects.reset();
    this.enrollment.clear();
    this.mentorRelationships.clear();
    this.avatarFoundry.clear();
  }

  getSystemStatus() {
    return {
      identity: "NOEMA",
      role: this.role,
      constitution: {
        active: true,
        version: getConstitution().version
      },
      provider: this.provider?.status?.() || {
        id: this.provider?.id || "",
        connected: this.provider?.connected === true
      },
      accountServer: this.accountServer.status(),
      enrollment: this.getEnrollmentStatus(),
      avatar: this.avatarFoundry.current(),
      memory: {
        longTermItems: this.memory.list().length,
        continuityItems: this.continuity.list().length,
        activeProject: this.projects.active()
      },
      capabilities: this.getCapabilities()
    };
  }
}
