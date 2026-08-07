export function createRouteTrace({
  route,
  ethics,
  capabilitySummary = []
} = {}) {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    mode: route?.mode?.id || "personal",
    selectedModules: (route?.modules || []).map(module => module.id),
    safetyCategories: route?.safety?.categories || [],
    privacySensitive: route?.privacy?.sensitive === true,
    constitution: {
      active: ethics?.active === true,
      version: ethics?.constitutionVersion || "",
      blocked: ethics?.blocked === true,
      concerns: (ethics?.concerns || []).map(item => item.id)
    },
    capabilities: capabilitySummary.map(item => ({
      id: item.id,
      state: item.state
    }))
  };
}
