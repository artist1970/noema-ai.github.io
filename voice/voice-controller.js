import {listBrowserVoices,speakText,stopSpeaking} from "./speech-output.js";
import {PushToTalk,RECOGNITION_POLICY} from "./push-to-talk.js";

const KEY="noema_voice_preferences_v1";

function storageOf(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export class VoiceController {
  constructor({
    storage,
    onTranscript=()=>{},
    onState=()=>{}
  }={}) {
    this.storage=storageOf(storage);
    this.preferences=this.load();
    this.pushToTalk=new PushToTalk({
      onTranscript,
      onState
    });
  }

  load() {
    try {
      const raw=JSON.parse(this.storage?.getItem(KEY) || "null");
      if (raw?.schemaVersion===1) return raw;
    } catch {}
    return {
      schemaVersion:1,
      voiceURI:"",
      rate:.95,
      pitch:1,
      autoRead:false
    };
  }

  save(patch={}) {
    this.preferences={
      schemaVersion:1,
      voiceURI:String(patch.voiceURI ?? this.preferences.voiceURI ?? "").slice(0,300),
      rate:Math.max(.65,Math.min(1.35,Number(patch.rate ?? this.preferences.rate)||.95)),
      pitch:Math.max(.7,Math.min(1.3,Number(patch.pitch ?? this.preferences.pitch)||1)),
      autoRead:false
    };
    try { this.storage?.setItem(KEY,JSON.stringify(this.preferences)); } catch {}
    return {...this.preferences};
  }

  voices(){return listBrowserVoices()}
  speak(text){return speakText(text,this.preferences)}
  stopSpeaking(){stopSpeaking()}
  startListening(){return this.pushToTalk.start()}
  stopListening(){return this.pushToTalk.stop()}

  status() {
    return {
      speechOutput:typeof window!=="undefined" && "speechSynthesis" in window,
      speechInput:this.pushToTalk.supported(),
      policy:RECOGNITION_POLICY,
      preferences:{...this.preferences}
    };
  }

  clear() {
    try { this.storage?.removeItem(KEY); } catch {}
    this.preferences=this.load();
    this.stopListening();
    this.stopSpeaking();
  }
}
