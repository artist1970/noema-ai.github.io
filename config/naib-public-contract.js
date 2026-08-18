/*
  Canonical NAIB public-front contract.

  This module is safe to import inside protected/internal runtime code.
  It contains references and policy metadata only — never credentials.
*/

export const NAIB_PUBLIC_CONTRACT = Object.freeze({
  version:"1.0.0",

  identity:Object.freeze({
    id:"naib",
    name:"NAIB",
    title:"Public Intelligence Director"
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

  gateway:Object.freeze({
    repository:"artist1970/noema-ai.github.io",
    role:"neutral-public-navigation-gateway"
  }),

  governance:Object.freeze({
    publicAdministrativeIdentityExposed:false,
    humanFinalAuthority:true,
    permissionSelfElevation:false
  })
});
