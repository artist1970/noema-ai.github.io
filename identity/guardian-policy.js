export const DEFAULT_GUARDIAN_POLICY = Object.freeze({
  id: "noema-default-guardian-policy",
  version: "1.0.0",
  childUnder13: {
    pathway: "guardian-managed-child",
    guardianRequired: true,
    independentCredentialEnrollment: false
  },
  teen13to17: {
    pathway: "guardian-linked-teen",
    guardianRequired: true,
    independentCredentialEnrollment: false
  },
  adult18Plus: {
    pathway: "independent-adult",
    guardianRequired: false,
    independentCredentialEnrollment: true
  },
  notes: [
    "This is NOEMA's default deployment policy, not a substitute for jurisdiction-specific legal review.",
    "A production server may apply stricter age and guardian rules.",
    "Age and grade are separate concepts; age never determines academic ability."
  ]
});

export function evaluateGuardianRequirement(profile = {}) {
  const band = profile.ageBand || "unknown";

  if (band === "child-under-13") {
    return {
      required: true,
      pathway: "guardian-managed-child",
      message: "A guardian-managed account pathway is required before remote enrollment."
    };
  }

  if (band === "teen-13-17") {
    return {
      required: true,
      pathway: "guardian-linked-teen",
      message: "A guardian-linked teen pathway is required before remote enrollment."
    };
  }

  if (band === "adult-18-plus") {
    return {
      required: false,
      pathway: "independent-adult",
      message: "Independent adult enrollment is available when a secure account server is connected."
    };
  }

  return {
    required: null,
    pathway: "unknown",
    message: "Age band is unresolved. Remote enrollment must not continue until the enrollment pathway is known."
  };
}
