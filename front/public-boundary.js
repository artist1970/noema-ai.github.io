export const PUBLIC_ADMIN_BOUNDARY = Object.freeze({
  publicIdentity:"NAIB",

  canonicalPublicFront:Object.freeze({
    repository:"artist1970/NAIB.github.io",
    url:"https://artist1970.github.io/NAIB.github.io/"
  }),

  canonicalPrivateCore:Object.freeze({
    ref:"artist1970/CORE/NAIBCore",
    publicBrowserFetchAllowed:false
  }),

  administrativeIdentity:"internal-governance",
  administrativeIdentityPubliclyExposed:false,

  publicMay:{
    converse:true,
    explain:true,
    plan:true,
    coordinateSpecialists:true,
    prepareHandoffs:true,
    presentVerifierStatus:true,
    usePermittedContext:true
  },

  publicMayNot:{
    elevatePermissions:true,
    alterConstitution:true,
    alterAuthentication:true,
    changeGuardianRules:true,
    bypassVerifier:true,
    writeLongTermMemoryWithoutUserAction:true,
    claimExternalExecutionWithoutExecution:true,
    exposeAdministrativeSecrets:true,
    fetchPrivateCoreDirectly:true
  }
});

export function publicBoundary() {
  return JSON.parse(JSON.stringify(PUBLIC_ADMIN_BOUNDARY));
}
