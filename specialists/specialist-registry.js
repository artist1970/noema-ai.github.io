export const SPECIALIST_STATES = Object.freeze({
  LOCAL: "local-integrated",
  HANDOFF: "handoff-ready",
  REMOTE: "remote-capable",
  UNAVAILABLE: "unavailable",
  RESTRICTED: "restricted",
  DISCOVERY: "manifest-discoverable"
});

export const SPECIALISTS = Object.freeze({

  resourceDirector: {
    id:"resource-director",
    label:"Learning Resource Federation",
    state:SPECIALIST_STATES.LOCAL,
    category:"learning-resource-discovery",
    purposes:["learning","research","archive","resource","search","family","workshop","game","course"],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:true,
    authority:"approved-learning-federation",
    notes:"Prioritizes the learner's Khaemenes stage, then Academy and approved learning extensions. Games require learning metadata. Discovery is not claim verification."
  },
  verifier: {
    id:"verifier",
    label:"The Verifier",
    state:SPECIALIST_STATES.LOCAL,
    category:"research-governance",
    purposes:["research","fact-check","current-events","medical","legal","atmospheric","history","science"],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:true,
    authority:"evidence-governance",
    notes:"Creates and evaluates verification sessions. Live retrieval still requires a configured research provider."
  },
  mentor: {
    id:"mentor",
    label:"Khaemenes Mentor",
    state:SPECIALIST_STATES.LOCAL,
    category:"learning-and-family",
    purposes:["learning","family","education","study","curriculum"],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:true,
    authority:"presentation-and-learning-context",
    notes:"Uses local enrollment, mentor identity and learning preferences. It does not determine factual truth."
  },
  sovereign: {
    id:"sovereign",
    label:"Sovereign Agent",
    state:SPECIALIST_STATES.LOCAL,
    category:"decision-support",
    purposes:["decision","planning","comparison","prioritization","work"],
    audiences:["student","adult"],
    requiresAccount:false,
    canExecuteLocally:true,
    authority:"bounded-decision-support",
    notes:"Provides structured decision criteria and options. It cannot authorize consequential actions."
  },
  prose: {
    id:"prose",
    label:"PROSE",
    state:SPECIALIST_STATES.HANDOFF,
    category:"writing",
    purposes:["writing","editing","drafting","work","creative"],
    audiences:["student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"writing-specialist",
    url:"https://vervenveda.com/proresource_hub.github.io/",
    notes:"Handoff-ready until a direct PROSE adapter is approved."
  },
  moirai: {
    id:"moirai",
    label:"Moirai",
    state:SPECIALIST_STATES.HANDOFF,
    category:"music-mentoring",
    purposes:[
      "music","songwriting","composition","melody","harmony",
      "rhythm","arrangement","instrumentation","music-theory",
      "ear-training","practice","performance-preparation",
      "recording","production","music-research"
    ],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"music-mentoring-and-refrain-resource-handoff",
    url:"https://artist1970.github.io/Moirai.github.io/",
    notes:"Music Mentor of The Refrain. Handoff-ready; preserves musician authorship, does not elevate permissions, does not claim unperformed recording, production, publishing or performance actions, and does not silently persist long-term memory."
  },
  archaemenes: {
    id:"archaemenes",
    label:"Archaemenes",
    state:SPECIALIST_STATES.HANDOFF,
    category:"academic-scholarship",
    purposes:["learning","education","study","curriculum","research","academic-writing","tutoring"],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"academic-mentoring-and-education-handoff",
    url:"https://artist1970.github.io/Archaemenes.github.io/",
    notes:"Scholarly AI of Khaemenes Academy. Uses age-adaptive presentation from Wise Owl through Scholar. Handoff-ready; does not modify grades, records, authentication, or claim unverified current facts as verified."
  },
  eiren: {
    id:"eiren",
    label:"Eiren",
    state:SPECIALIST_STATES.HANDOFF,
    category:"reflective-creative-companion",
    purposes:["reflection","poetry","songwriting","story","creative-writing","creative","music","art-prompt"],
    audiences:["student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"reflective-creative-guidance-and-resource-handoff",
    url:"https://artist1970.github.io/Eiren.github.io/",
    notes:"Poet, songwriter, reflective companion, and creative guide. Handoff-ready; preserves user authorship, does not elevate permissions, does not silently persist long-term memory, and does not claim remote execution."
  },
  zelle: {
    id:"zelle",
    label:"Zelle",
    state:SPECIALIST_STATES.HANDOFF,
    category:"bazaar-art-direction",
    purposes:[
      "creative","art","visual","bazaar-art","art-direction","design",
      "color","composition","illustration","painting","photography",
      "mixed-media","visual-storytelling","creative-block","idea-development"
    ],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"bazaar-art-direction-and-creative-guidance-handoff",
    url:"https://artist1970.github.io/Zelle.github.io/",
    notes:"Art Director at Bazaar Art. Provides creative direction for visual art while preserving the creator's authorship and final artistic authority. Handoff-ready; does not own ecosystem resources, elevate permissions, silently persist long-term memory, or claim remote execution."
  },
  aurora: {
    id:"aurora",
    label:"Aurora",
    state:SPECIALIST_STATES.UNAVAILABLE,
    category:"restorative-wellness",
    purposes:[
      "wellness","breathing","meditation","affirmations","grounding",
      "relaxation","rest-preparation","natural-wellness","reflective-wellness"
    ],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"wellness-guidance-with-non-diagnostic-boundaries",
    url:"https://artist1970.github.io/Aurora.github.io/",
    notes:"Zen and wellness specialist for gentle breathing, meditation, affirmations, grounding, relaxation and natural-wellness education. Current public interface is not yet available, so Aurora must not be represented as having executed or accepted a handoff. She does not diagnose, prescribe, promise cures, replace urgent care, or override qualified medical care."
  },
  arshif: {
    id:"arshif",
    label:"ARSHIF",
    state:SPECIALIST_STATES.DISCOVERY,
    category:"archive",
    purposes:["archive","history","research","reference","reading"],
    audiences:["child","student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"archive-and-context",
    url:"https://vervenveda.com/Arshif.github.io/",
    notes:"Manifest-discoverable archive/context pathway. Opening an ARSHIF app remains a user-facing handoff. It is not a privileged truth authority."
  },
  pleraSearch: {
    id:"plera-search",
    label:"PLERA Search",
    state:SPECIALIST_STATES.DISCOVERY,
    category:"discovery",
    purposes:["search","research","discovery","current-events"],
    audiences:["student","adult"],
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"discovery",
    url:"https://vervenveda.com/PLERASearch.github.io/",
    notes:"Manifest-discoverable outer research pathway. Opening the search app remains a user-facing handoff. Search ranking does not create verified truth."
  },
  hope: {
    id:"hope",
    label:"Hope",
    state:SPECIALIST_STATES.HANDOFF,
    category:"compassionate-community-navigation",
    purposes:["companion","community-support","family","caregiving","veterans","seniors","housing","basic-needs","health-resource-navigation","benefits","financial-stability","employment","training","education","documents","legal-resource-preparation","transition-planning"],
    audiences:["adult"],
    requiresExplicitRequest:true,
    requiresAccount:false,
    canExecuteLocally:false,
    authority:"compassionate-community-navigation-and-resource-handoff",
    url:"https://artist1970.github.io/Hope.github.io/",
    notes:"Compassionate companion and community navigator. Handoff-ready; preserves dignity and user choice, does not guarantee eligibility, availability or outcomes, does not store sensitive documents or silently inherit private/founder memory, and routes current or consequential information through approved verification."
  },
  network333: {
    id:"333",
    label:"333 Network",
    state:SPECIALIST_STATES.RESTRICTED,
    category:"communication",
    purposes:["communication","message","network"],
    audiences:["adult"],
    requiresAccount:true,
    canExecuteLocally:false,
    authority:"communication-handoff",
    url:"https://vervenveda.com/333.github.io/",
    notes:"Account-aware communication remains restricted until authenticated account infrastructure is connected."
  }
});

export function getSpecialist(id) {
  return SPECIALISTS[id] || Object.values(SPECIALISTS).find(item=>item.id===id) || null;
}

export function listSpecialists() {
  return Object.values(SPECIALISTS).map(item=>({...item}));
}

export function specialistEligible(id,{
  audience="adult",
  explicitRequest=false,
  accountConnected=false
}={}) {
  const s=getSpecialist(id);
  if(!s) return {eligible:false,reason:"unknown-specialist",specialist:null};
  if(!s.audiences.includes(audience)) return {eligible:false,reason:"audience-restricted",specialist:s};
  if(s.requiresExplicitRequest && !explicitRequest) return {eligible:false,reason:"explicit-request-required",specialist:s};
  if(s.requiresAccount && !accountConnected) return {eligible:false,reason:"account-required",specialist:s};
  return {eligible:true,reason:"eligible",specialist:s};
}
