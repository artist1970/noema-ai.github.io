export const RECOGNITION_POLICY=Object.freeze({
  continuous:false,
  interimResults:true,
  autoSend:false,
  backgroundListening:false,
  audioStorage:false
});

export class PushToTalk {
  constructor({
    onTranscript=()=>{},
    onState=()=>{},
    language=""
  }={}) {
    this.onTranscript=onTranscript;
    this.onState=onState;
    this.language=language;
    this.recognition=null;
    this.listening=false;
  }

  supported() {
    if (typeof window==="undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start() {
    if (!this.supported()) {
      this.onState({state:"unavailable"});
      return {ok:false,reason:"Speech recognition is unavailable in this browser."};
    }
    if (this.listening) return {ok:false,reason:"Already listening."};

    const Recognition=window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition=new Recognition();
    recognition.continuous=RECOGNITION_POLICY.continuous;
    recognition.interimResults=RECOGNITION_POLICY.interimResults;
    if (this.language) recognition.lang=this.language;

    recognition.onstart=()=>{
      this.listening=true;
      this.onState({state:"listening"});
    };

    recognition.onresult=event=>{
      let finalText="";
      let interimText="";
      for (let i=event.resultIndex;i<event.results.length;i++) {
        const text=event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalText+=text;
        else interimText+=text;
      }
      this.onTranscript({
        finalText:finalText.trim(),
        interimText:interimText.trim(),
        autoSend:false
      });
    };

    recognition.onerror=event=>{
      this.onState({state:"error",error:String(event.error || "recognition-error")});
    };

    recognition.onend=()=>{
      this.listening=false;
      this.recognition=null;
      this.onState({state:"idle"});
    };

    this.recognition=recognition;
    recognition.start();
    return {ok:true};
  }

  stop() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }
    return {ok:true};
  }
}
