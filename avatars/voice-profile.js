export const VOICE_STYLES = Object.freeze([
  "calm","warm","bright","measured","expressive","neutral"
]);

export function normalizeVoiceProfile(input={}) {
  return {
    style: VOICE_STYLES.includes(input.style) ? input.style : "warm",
    browserVoiceURI: String(input.browserVoiceURI || "").slice(0,300),
    rate: Math.max(.65,Math.min(1.35,Number(input.rate)||.95)),
    pitch: Math.max(.7,Math.min(1.3,Number(input.pitch)||1)),
    volume: 1,
    listenMode: "push-to-talk-only",
    backgroundListening: false
  };
}

export function speakMentorText(text,profile={}) {
  if(typeof window==="undefined" || !("speechSynthesis" in window)) {
    return {ok:false,reason:"Browser speech output is unavailable."};
  }
  const p=normalizeVoiceProfile(profile);
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text||"").slice(0,1200));
  u.rate=p.rate; u.pitch=p.pitch; u.volume=1;
  const voices=window.speechSynthesis.getVoices?.()||[];
  if(p.browserVoiceURI) {
    const selected=voices.find(v=>v.voiceURI===p.browserVoiceURI);
    if(selected) u.voice=selected;
  }
  window.speechSynthesis.speak(u);
  return {ok:true};
}
