export const CAPABILITY_STATES = Object.freeze({
  ALLOW: "allow",
  CONFIRM: "confirm",
  ADMIN: "admin-approval",
  BLOCK: "blocked",
  UNAVAILABLE: "unavailable"
});

export const NOEMA_CAPABILITIES = Object.freeze({
  "conversation.respond": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Respond conversationally within active policy."
  },
  "resources.search": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Search approved ecosystem resources subject to Mentor policy and freshness requirements."
  },
  "resources.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read approved resources available to the active role."
  },
  "research.current": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Research current information when a freshness-capable source or provider is available.",
    conditions: ["freshness-verification"]
  },
  "preferences.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read NOEMA-local preferences."
  },
  "preferences.write": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Store low-risk NOEMA interface preferences using namespaced local storage."
  },
  "memory.record": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Retain longer-term personal continuity beyond transient conversation.",
    conditions: ["user-visible", "removable", "purpose-limited"]
  },
  "memory.delete": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Delete retained NOEMA continuity or memory."
  },
  "files.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read files the user has intentionally made available."
  },
  "files.modify": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Modify user files with an explicit request."
  },
  "messages.send": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Send or publish communication only with explicit user authority."
  },
  "calendar.write": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Create, update, delete, or respond to calendar events only with explicit user authority."
  },
  "accounts.access": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Access an authenticated account only within granted scope."
  },
  "commerce.purchase": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA does not autonomously purchase goods or commit funds."
  },
  "admin.read": {
    state: CAPABILITY_STATES.ADMIN,
    description: "Read protected administrative state only after authenticated administrator authorization."
  },
  "code.propose-update": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Inspect architecture and prepare a versioned update proposal."
  },
  "code.test-proposal": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Run permitted tests against a proposed update."
  },
  "code.deploy-canonical": {
    state: CAPABILITY_STATES.ADMIN,
    description: "Canonical code changes require administrator approval and repository authorization."
  },
  "permissions.elevate-self": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA cannot elevate her own privileges."
  },
  "ethics.disable": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA cannot disable her constitutional ethics layer at runtime."
  },
  "authentication.modify": {
    state: CAPABILITY_STATES.ADMIN,
    description: "Authentication changes require administrator-controlled review."
  }
});

export class CapabilityLedger {
  constructor({ overrides = {} } = {}) {
    // Overrides may make a capability stricter, but not weaken blocked/admin
    // constitutional capabilities from an ordinary runtime context.
    this.capabilities = { ...NOEMA_CAPABILITIES };

    for (const [id, proposed] of Object.entries(overrides || {})) {
      if (!this.capabilities[id]) continue;
      const current = this.capabilities[id];
      const locked = [CAPABILITY_STATES.BLOCK, CAPABILITY_STATES.ADMIN].includes(current.state);
      if (locked && proposed?.state &&
          ![CAPABILITY_STATES.BLOCK, CAPABILITY_STATES.ADMIN].includes(proposed.state)) {
        continue;
      }
      this.capabilities[id] = { ...current, ...proposed };
    }
  }

  get(id) {
    const value = this.capabilities[id];
    return value ? { id, ...value } : null;
  }

  list() {
    return Object.entries(this.capabilities).map(([id, value]) => ({
      id,
      ...value
    }));
  }
}
