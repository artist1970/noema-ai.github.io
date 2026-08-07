export function listBrowserVoices() {
  if (typeof window==="undefined" || !("speechSynthesis" in window)) return [];
  return (window.speechSynthesis.getVoices?.() || []).map(v=>({
    voiceURI:v.voiceURI,
    name:v.name,
    lang:v.lang,
    localService:v.localService === true,
    default:v.default === true
  }));
}

export function speakText(text,{
  voiceURI="",
  rate=.95,
  pitch=1,
  volume=1
}={}) {
  if (typeof window==="undefined" || !("speechSynthesis" in window)) {
    return {ok:false,reason:"Speech output is unavailable in this browser."};
  }

  const content=String(text || "").trim().slice(0,12000);
  if (!content) return {ok:false,reason:"There is no text to read aloud."};

  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(content);
  utterance.rate=Math.max(.65,Math.min(1.35,Number(rate)||.95));
  utterance.pitch=Math.max(.7,Math.min(1.3,Number(pitch)||1));
  utterance.volume=Math.max(0,Math.min(1,Number(volume)||1));

  if (voiceURI) {
    const voice=(window.speechSynthesis.getVoices?.() || []).find(v=>v.voiceURI===voiceURI);
    if (voice) utterance.voice=voice;
  }

  window.speechSynthesis.speak(utterance);
  return {ok:true};
}

export function stopSpeaking() {
  if (typeof window!=="undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
