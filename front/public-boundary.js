export const PUBLIC_ADMIN_BOUNDARY = Object.freeze({
  publicIdentity:"NAIB",
  administrativeIdentity:"NOEMA",
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
    exposeAdministrativeSecrets:true
  }
});

export function publicBoundary() {
  return JSON.parse(JSON.stringify(PUBLIC_ADMIN_BOUNDARY));
}
