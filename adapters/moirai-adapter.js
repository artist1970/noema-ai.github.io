/*
  Moirai Handoff Adapter
  Version: 0.2.0
  Architecture: Noema -> NAIB -> Moirai -> The Refrain

  This adapter preserves the existing createMoiraiHandoff() contract used by
  Noema's specialist executor while updating Moirai to her canonical role as
  Music Mentor of The Refrain.

  It prepares guidance and a user-facing handoff only. It does not claim that
  a performance, recording, mix, master, publication, upload, or other remote
  action occurred.
*/

export const MOIRAI_URL = "https://artist1970.github.io/Moirai.github.io/";

const MODES = Object.freeze([
  "learn",
  "compose",
  "songwrite",
  "arrange",
  "practice",
  "perform",
  "produce",
  "research"
]);

const DOMAINS = Object.freeze([
  { id:"melody", terms:["melody","motif","theme","tune","melodic","phrase"] },
  { id:"harmony", terms:["harmony","chord","chords","progression","voicing","harmonic","key"] },
  { id:"rhythm", terms:["rhythm","meter","tempo","beat","groove","time signature","syncopation"] },
  { id:"songwriting", terms:["song","songwriting","verse","chorus","bridge","hook","lyrics","lyric"] },
  { id:"composition", terms:["compose","composition","piece","score","form","movement","counterpoint"] },
  { id:"arrangement", terms:["arrange","arrangement","instrument","instrumentation","orchestration","ensemble"] },
  { id:"theory", terms:["theory","scale","interval","mode","notation","cadence","analysis"] },
  { id:"ear-training", terms:["ear training","interval recognition","dictation","aural","listen","listening"] },
  { id:"practice", terms:["practice","rehearse","rehearsal","technique","warmup","warm-up","routine"] },
  { id:"performance", terms:["perform","performance","stage","recital","audition","concert","setlist"] },
  { id:"production", terms:["record","recording","production","mix","mixing","master","mastering","track","studio","audio"] },
  { id:"research", terms:["research","history","composer","genre","style","reference","source"] }
]);

function normalize(value="") {
  return String(value ?? "").trim().toLowerCase();
}

function inferMode(text="", requested="") {
  const explicit=normalize(requested);
  if(MODES.includes(explicit)) return explicit;

  const q=normalize(text);
  if(/\b(record|recording|mix|mixing|master|mastering|produce|production|studio)\b/.test(q)) return "produce";
  if(/\b(perform|performance|recital|audition|concert|stage|setlist)\b/.test(q)) return "perform";
  if(/\b(practice|rehearse|rehearsal|warmup|warm-up|technique)\b/.test(q)) return "practice";
  if(/\b(arrange|arrangement|instrumentation|orchestration)\b/.test(q)) return "arrange";
  if(/\b(songwrite|songwriting|lyrics|lyric|verse|chorus|bridge|hook)\b/.test(q)) return "songwrite";
  if(/\b(compose|composition|piece|score|motif|theme)\b/.test(q)) return "compose";
  if(/\b(research|history|composer|genre|source|reference)\b/.test(q)) return "research";
  return "learn";
}

function detectDomains(text="") {
  const q=normalize(text);
  return DOMAINS
    .map(domain=>({
      id:domain.id,
      score:domain.terms.reduce((score,term)=>score+(q.includes(term)?1:0),0)
    }))
    .filter(item=>item.score>0)
    .sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id))
    .map(item=>item.id);
}

export function createMoiraiHandoff({
  prompt = "",
  message = "",
  query = "",
  mode = "",
  theme = "",
  mood = "",
  palette = ""
} = {}) {
  const sourceText=String(prompt || message || query || "");
  const musicalMode=inferMode(sourceText, mode || theme);
  const domains=detectDomains(sourceText);

  return {
    module:"moirai",
    specialist:"moirai",
    version:"0.2.0",
    url:MOIRAI_URL,
    status:"handoff-ready",
    executed:false,
    principle:"Flow · Create · Connect",
    brief:{
      prompt:sourceText,
      mode:musicalMode,
      domains,
      mood:String(mood || ""),
      legacyPalette:String(palette || "")
    },
    boundaries:[
      "no-administrative-authority",
      "no-permission-elevation",
      "no-resource-ownership",
      "no-impersonation",
      "no-silent-long-term-memory",
      "no-remote-execution-claims",
      "preserve-musician-authorship",
      "no-false-performance-or-recording-claims",
      "no-false-publication-claims"
    ],
    note:
      "Moirai is the Music Mentor of The Refrain. This adapter prepares musical guidance and a user-facing handoff without claiming external execution."
  };
}
