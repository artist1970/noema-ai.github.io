export const CAPABILITY_STATES = Object.freeze({
  ALLOW: "allow",
  CONFIRM: "confirm",
  ADMIN: "admin-approval",
  BLOCK: "blocked",
  UNAVAILABLE: "unavailable"
});

export const NOEMA_CAPABILITIES = Object.freeze({





  "orchestration.plan": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Create a transparent task graph from the user's request, mode, project context and verification requirements."
  },
  "orchestration.execute-local": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Run approved local specialist adapters that do not create consequential external side effects."
  },
  "orchestration.external-handoff": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Prepare transparent specialist handoffs while clearly marking them as not executed."
  },
  "orchestration.fake-execution": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA may not claim that a specialist, search, model, account action or external tool executed when only a plan or handoff was produced."
  },
  "orchestration.self-authorize-action": {
    state: CAPABILITY_STATES.BLOCK,
    description: "Task orchestration cannot bypass confirmation, administrator approval, guardian rules, account authentication, or other capability gates."
  },
  "mentor.adapt-presentation": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Adapt explanation style from expressed learning and mentor preferences without changing evidence standards, academic opportunity, or safety policy."
  },
  "mentor.infer-from-appearance": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA and mentors may not infer intelligence, ability, temperament, demographics, academic potential or psychological state from avatar appearance."
  },

  "provider.invoke": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Invoke the active provider only after NOEMA routing, Constitution, privacy, safety, research and context-minimization layers."
  },
  "provider.configure-remote": {
    state: CAPABILITY_STATES.ADMIN,
    description: "Changing the canonical remote provider endpoint requires administrator-controlled deployment."
  },
  "provider.store-credentials": {
    state: CAPABILITY_STATES.BLOCK,
    description: "Public NOEMA browser code may not store model-provider credentials, passwords, bearer tokens or database secrets."
  },
  "provider.change-permissions": {
    state: CAPABILITY_STATES.BLOCK,
    description: "A model provider may not change NOEMA, guardian, account, memory or specialist permissions."
  },
  "provider.write-memory": {
    state: CAPABILITY_STATES.BLOCK,
    description: "A provider response cannot directly write long-term NOEMA memory."
  },
  "provider.override-verifier": {
    state: CAPABILITY_STATES.BLOCK,
    description: "A conversational provider may not bypass The Verifier evidence gates or self-assign verified-fact status."
  },
  "voice.speak": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read visible NOEMA text aloud through browser speech synthesis."
  },
  "voice.listen": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Start one explicit user-initiated push-to-talk recognition session; transcript is returned to the composer for review."
  },
  "voice.background-listen": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA may not listen continuously or activate ambient/background microphone capture."
  },
  "voice.store-audio": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA v0.9 does not record or persist microphone audio."
  },
  "specialist.delegate": {
    state: CAPABILITY_STATES.ALLOW,
    description: "NOEMA may route a request to bounded specialist systems while retaining supervisory policy."
  },
  "specialist.direct-mutation": {
    state: CAPABILITY_STATES.BLOCK,
    description: "Specialist outputs are advisory proposals and cannot directly mutate NOEMA permissions, authentication, memory or constitutional policy."
  },

  "research.verify": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Build a transparent verification plan and evaluate supplied evidence before using a verified-fact label."
  },
  "research.verification-save": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Save a local verification session, sources, and verdict through explicit user action."
  },
  "research.live-retrieval": {
    state: CAPABILITY_STATES.UNAVAILABLE,
    description: "Live multi-source retrieval requires a configured secure research provider or server."
  },
  "research.override-verdict-gates": {
    state: CAPABILITY_STATES.BLOCK,
    description: "NOEMA and specialist agents may not bypass required evidence, independence, freshness, or domain verification gates."
  },

  "avatar.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read the user's explicitly adopted mentor manifest."
  },
  "avatar.design": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Preview mentor designs and local drawing cleanup without changing permissions."
  },
  "avatar.sketch-save": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Save a user-created mentor sketch and its reversible cleaned version."
  },
  "avatar.save-draft": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Save a local mentor design through explicit user action."
  },
  "avatar.adopt": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Adopt the mentor into the existing person-to-mentor relationship through explicit user action."
  },
  "avatar.change-permissions": {
    state: CAPABILITY_STATES.BLOCK,
    description: "Avatar customization can never elevate system, guardian, account, or resource permissions."
  },

  "identity.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read the local NOEMA enrollment profile for contextual routing."
  },
  "identity.write": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Create or update a local enrollment profile with explicit user action."
  },
  "guardian.link": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Create or change a guardian relationship only through an explicit enrollment action."
  },
  "account.remote-auth": {
    state: CAPABILITY_STATES.UNAVAILABLE,
    description: "Remote authentication remains unavailable until a secure HTTPS account server is deliberately configured."
  },
  "account.cross-device-sync": {
    state: CAPABILITY_STATES.UNAVAILABLE,
    description: "Cross-device identity sync remains unavailable until a secure account server is connected."
  },

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
  "memory.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read explicitly retained NOEMA memory for relevant context."
  },
  "memory.record": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Retain longer-term personal continuity beyond transient conversation.",
    conditions: ["user-visible", "removable", "purpose-limited"]
  },
  "memory.edit": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Edit a retained memory with explicit user action."
  },
  "memory.delete": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Delete retained NOEMA continuity or memory."
  },
  "memory.export": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Export the user's local NOEMA Memory Library as a portable JSON file."
  },
  "projects.read": {
    state: CAPABILITY_STATES.ALLOW,
    description: "Read NOEMA-local project context."
  },
  "projects.write": {
    state: CAPABILITY_STATES.CONFIRM,
    description: "Create or edit persistent project context with explicit user action."
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
