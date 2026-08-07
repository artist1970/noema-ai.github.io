const MODULE_TO_SPECIALIST=Object.freeze({
  mentor:"Khaemenes Mentor",
  sovereign:"Sovereign Agent",
  moirai:"Moirai",
  prose:"PROSE",
  arshif:"ARSHIF",
  verifier:"The Verifier",
  "plera-search":"PLERA Search",
  "333":"333 Network"
});

export function buildDelegation(route={}, {researchRequired=false}={}) {
  const specialists=(route.modules || [])
    .map(module=>MODULE_TO_SPECIALIST[module.id] || module.label || module.id)
    .filter(Boolean);

  if (researchRequired && !specialists.includes("The Verifier")) {
    specialists.unshift("The Verifier");
  }

  return {
    primary:"NOEMA",
    specialists:[...new Set(specialists)].slice(0,8),
    policy:{
      specialistsAreAdvisory:true,
      specialistsMayNotElevatePermissions:true,
      specialistsMayNotWriteLongTermMemoryDirectly:true,
      specialistsMayNotDisableConstitution:true,
      childSafetyMayNotBeWeakened:true
    }
  };
}
