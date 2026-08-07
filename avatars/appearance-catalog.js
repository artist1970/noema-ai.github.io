export const HAIR_STYLES = Object.freeze([
  "short","wavy","curly","coily","long","bob","braids","locs","ponytail","bun","bald"
]);

export const HAIR_COLORS = Object.freeze([
  {id:"black",value:"#171411",label:"Black"},
  {id:"espresso",value:"#3a251b",label:"Espresso"},
  {id:"brown",value:"#68452e",label:"Brown"},
  {id:"auburn",value:"#8b3f28",label:"Auburn"},
  {id:"copper",value:"#b45f33",label:"Copper"},
  {id:"blonde",value:"#d9b66b",label:"Blonde"},
  {id:"platinum",value:"#eee5d4",label:"Platinum"},
  {id:"gray",value:"#8d8c8a",label:"Gray"},
  {id:"silver",value:"#c7ccd2",label:"Silver"},
  {id:"rose",value:"#c86f86",label:"Rose"},
  {id:"violet",value:"#6654a9",label:"Violet"},
  {id:"blue",value:"#35679a",label:"Blue"},
  {id:"green",value:"#41735d",label:"Green"}
]);

export const EYE_COLORS = Object.freeze([
  {id:"brown",value:"#5d3a26",label:"Brown"},
  {id:"dark-brown",value:"#2f211b",label:"Dark Brown"},
  {id:"hazel",value:"#856d35",label:"Hazel"},
  {id:"green",value:"#5f7f58",label:"Green"},
  {id:"blue",value:"#5e83a5",label:"Blue"},
  {id:"gray",value:"#7d858b",label:"Gray"},
  {id:"amber",value:"#aa7837",label:"Amber"},
  {id:"violet",value:"#78629a",label:"Violet"}
]);

/*
  Visual palette only. Skin tone selections are not racial or ethnic labels
  and never enter learner inference.
*/
export const SKIN_TONES = Object.freeze([
  {id:"tone-01",value:"#f7dfce"},
  {id:"tone-02",value:"#edc7aa"},
  {id:"tone-03",value:"#dda982"},
  {id:"tone-04",value:"#c98d68"},
  {id:"tone-05",value:"#b87954"},
  {id:"tone-06",value:"#986044"},
  {id:"tone-07",value:"#754834"},
  {id:"tone-08",value:"#563526"},
  {id:"tone-09",value:"#3c271f"}
]);

export const OUTFIT_STYLES = Object.freeze([
  "classic","casual","scholarly","creative","outdoors","modern","cozy","sporty"
]);

export const ACCENT_COLORS = Object.freeze([
  {id:"midnight",value:"#17243a",label:"Midnight"},
  {id:"gold",value:"#c7a45c",label:"Gold"},
  {id:"forest",value:"#355c4b",label:"Forest"},
  {id:"violet",value:"#63558f",label:"Violet"},
  {id:"rose",value:"#a65d72",label:"Rose"},
  {id:"ocean",value:"#3d6f86",label:"Ocean"},
  {id:"coral",value:"#ba6a58",label:"Coral"},
  {id:"plum",value:"#654459",label:"Plum"}
]);

export function colorValue(catalog,id,fallback) {
  return catalog.find(item=>item.id===id)?.value || fallback;
}
