/*
  Canonical NAIB public-front contract.

  Safe to import inside protected/internal runtime code.
  References and policy metadata only — never credentials.

  Governance boundary:
  - Noema is the private Chancellor.
  - NAIB is the Administrator and canonical public administrative front.
*/
export const NAIB_PUBLIC_CONTRACT = Object.freeze({
  version:"1.1.0",

  identity:Object.freeze({
    id:"naib",
    name:"NAIB",
    title:"Administrator",
    role:"administrator"
  }),

  publicFront:Object.freeze({
    canonical:true,
    repository:"artist1970/NAIB.github.io",
    url:"https://artist1970.github.io/NAIB.github.io/"
  }),

  core:Object.freeze({
    canonicalRef:"artist1970/CORE/NAIBCore",
    visibility:"private",
    browserFetchAllowed:false
  }),

  runtime:Object.freeze({
    repository:"artist1970/noema-ai.github.io",
    role:"protected-administrative-runtime-bridge"
  }),

  governance:Object.freeze({
    chancellor:"NOEMA",
    chancellorVisibility:"private",
    exposeChancellorAsPublicDestination:false,
    humanFinalAuthority:true,
    permissionSelfElevation:false,
    mentorAdministrativeAuthority:false
  })
});
