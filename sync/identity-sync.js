export class IdentitySync {
  constructor({
    enrollmentStore,
    mentorRelationshipStore,
    accountServerClient
  } = {}) {
    this.enrollment = enrollmentStore;
    this.relationships = mentorRelationshipStore;
    this.server = accountServerClient;
  }

  localSnapshot() {
    const profile = this.enrollment?.load?.() || null;
    const relationship = this.relationships?.load?.() || null;

    return {
      mode: "local",
      crossDevice: false,
      profile,
      relationship
    };
  }

  status() {
    return {
      localProfile: !!this.enrollment?.load?.(),
      localMentorRelationship: !!this.relationships?.load?.(),
      server: this.server?.status?.() || {
        enabled: false,
        connected: false
      }
    };
  }

  async remoteSnapshot() {
    if (!this.server?.connected) {
      return {
        ok: false,
        mode: "local-only",
        reason: "No secure account server is configured."
      };
    }

    const [account, relationship] = await Promise.all([
      this.server.me(),
      this.server.getMentorRelationship()
    ]);

    return {
      ok: true,
      mode: "remote",
      crossDevice: true,
      account,
      relationship
    };
  }
}
