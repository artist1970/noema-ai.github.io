import {HAIR_STYLES,HAIR_COLORS,EYE_COLORS,SKIN_TONES,OUTFIT_STYLES,ACCENT_COLORS} from "./appearance-catalog.js";
import {getTemperament,isAllowedTrait,isAllowedCollaborationStyle} from "./personality-catalog.js";
import {normalizeVoiceProfile} from "./voice-profile.js";

function clean(v,max=120){return String(v||"").trim().slice(0,max)}
function inCatalog(items,v,fallback){
  return items.some(item=>(typeof item==="string"?item:item.id)===v)?v:fallback;
}

export function normalizeAvatarManifest(input={}){
  const temperament=getTemperament(input.temperament);
  const creationMode=input.creationMode==="sketch"?"sketch":"parts";

  return {
    schemaVersion:1,
    mentorId:clean(input.mentorId,100),
    displayName:clean(input.displayName,30)||"My Mentor",
    supervisor:"noema",
    status:input.status==="adopted"?"adopted":"draft",
    creationMode,

    appearance:{
      hairStyle:inCatalog(HAIR_STYLES,input.appearance?.hairStyle,"wavy"),
      hairColor:inCatalog(HAIR_COLORS,input.appearance?.hairColor,"brown"),
      eyeColor:inCatalog(EYE_COLORS,input.appearance?.eyeColor,"brown"),
      skinTone:inCatalog(SKIN_TONES,input.appearance?.skinTone,"tone-04"),
      outfitStyle:inCatalog(OUTFIT_STYLES,input.appearance?.outfitStyle,"classic"),
      primaryColor:inCatalog(ACCENT_COLORS,input.appearance?.primaryColor,"midnight"),
      secondaryColor:inCatalog(ACCENT_COLORS,input.appearance?.secondaryColor,"gold")
    },

    artSource:{
      mode:creationMode,
      sketchId:clean(input.artSource?.sketchId,120)||null,
      provenance:creationMode==="sketch"?"user-drawn":"structured-builder",
      originalPreserved:creationMode==="sketch",
      refinementStatus:clean(input.artSource?.refinementStatus,40)||
        (creationMode==="sketch"?"local-cleanup":"not-applicable")
    },

    temperament:temperament.id,

    traits:Array.isArray(input.traits)
      ? [...new Set(input.traits.filter(isAllowedTrait))].slice(0,4)
      : ["patient","encouraging"],

    collaboration:Array.isArray(input.collaboration)
      ? [...new Set(input.collaboration.filter(isAllowedCollaborationStyle))].slice(0,4)
      : ["ask-questions","show-examples"],

    sharedInterests:Array.isArray(input.sharedInterests)
      ? [...new Set(input.sharedInterests.map(v=>clean(v,40)).filter(Boolean))].slice(0,8)
      : [],

    voice:normalizeVoiceProfile(input.voice),

    adoption:{
      adoptedAt:input.adoption?.adoptedAt||null,
      adoptionVersion:"mentor-adoption-v1",
      relationshipLanguage:"learning-companion"
    },

    inferenceBoundary:{
      appearanceUsedForLearnerInference:false,
      appearanceUsedForAbilityInference:false,
      appearanceUsedForDemographicInference:false,
      drawingUsedForPsychologicalInference:false
    },

    updatedAt:new Date().toISOString()
  };
}
