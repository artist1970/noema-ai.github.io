import {mirrorStroke} from "./sketch-refiner.js";

export class SketchCanvas{
  constructor(canvas,{guideCanvas=null,onChange=()=>{}}={}){
    this.canvas=canvas;
    this.guideCanvas=guideCanvas;
    this.ctx=canvas?.getContext?.("2d")||null;
    this.guideCtx=guideCanvas?.getContext?.("2d")||null;
    this.onChange=onChange;
    this.strokes=[];
    this.redoStack=[];
    this.active=null;
    this.color="#17243a";
    this.width=4;
    this.opacity=1;
    this.eraser=false;
    this.symmetry=false;
    this.guide="face";
    this.guideStep=2;
    this.#bind();
    this.resize();
  }

  #bind(){
    if(!this.canvas) return;
    this.canvas.addEventListener("pointerdown",e=>this.#down(e));
    this.canvas.addEventListener("pointermove",e=>this.#move(e));
    this.canvas.addEventListener("pointerup",e=>this.#up(e));
    this.canvas.addEventListener("pointercancel",e=>this.#up(e));
  }

  resize(){
    if(!this.canvas) return;
    const rect=this.canvas.getBoundingClientRect();
    const ratio=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));
    const w=Math.max(280,Math.round(rect.width||600));
    const h=Math.max(380,Math.round(rect.height||520));
    for(const c of [this.canvas,this.guideCanvas].filter(Boolean)){
      c.width=Math.round(w*ratio); c.height=Math.round(h*ratio);
      c.getContext("2d").setTransform(ratio,0,0,ratio,0,0);
    }
    this.logicalWidth=w; this.logicalHeight=h;
    this.renderGuide();
    this.render();
  }

  #point(e){
    const r=this.canvas.getBoundingClientRect();
    return {x:e.clientX-r.left,y:e.clientY-r.top,pressure:Number(e.pressure)||.5};
  }

  #down(e){
    e.preventDefault();
    this.canvas.setPointerCapture?.(e.pointerId);
    this.redoStack=[];
    this.active={
      color:this.color,
      width:this.width,
      opacity:this.opacity,
      eraser:this.eraser,
      points:[this.#point(e)]
    };
    this.strokes.push(this.active);
    this.render();
  }

  #move(e){
    if(!this.active) return;
    e.preventDefault();
    const p=this.#point(e);
    const last=this.active.points[this.active.points.length-1];
    if(Math.hypot(p.x-last.x,p.y-last.y)<1.3) return;
    this.active.points.push(p);
    this.render();
  }

  #up(){
    if(!this.active) return;
    const finished=this.active;
    this.active=null;
    if(this.symmetry && !finished.eraser){
      this.strokes.push(mirrorStroke(finished,(this.logicalWidth||600)/2));
    }
    this.render();
    this.onChange(this.strokes);
  }

  setStrokes(strokes=[]){this.strokes=JSON.parse(JSON.stringify(strokes||[]));this.redoStack=[];this.render()}
  setColor(v){this.color=v;this.eraser=false}
  setWidth(v){this.width=Math.max(1,Math.min(18,Number(v)||4))}
  setOpacity(v){this.opacity=Math.max(.1,Math.min(1,Number(v)||1))}
  setEraser(v){this.eraser=v===true}
  setSymmetry(v){this.symmetry=v===true;this.renderGuide()}
  setGuide(name){this.guide=name;this.renderGuide()}
  setGuideStep(step){this.guideStep=Math.max(1,Math.min(3,Number(step)||2));this.renderGuide()}

  undo(){
    const last=this.strokes.pop();
    if(last) this.redoStack.push(last);
    this.render();this.onChange(this.strokes);
  }
  redo(){
    const item=this.redoStack.pop();
    if(item) this.strokes.push(item);
    this.render();this.onChange(this.strokes);
  }
  clear(){this.strokes=[];this.redoStack=[];this.render();this.onChange(this.strokes)}

  renderGuide(){
    const c=this.guideCtx;if(!c) return;
    const w=this.logicalWidth||600,h=this.logicalHeight||520;
    c.clearRect(0,0,w,h);
    const alpha=this.guideStep===1?.28:this.guideStep===2?.16:.08;
    c.strokeStyle=`rgba(23,36,58,${alpha})`;
    c.lineWidth=this.guideStep===1?2:1.5;
    c.lineCap="round";c.lineJoin="round";

    if(this.guide==="none") return;

    if(this.guide==="grid"){
      c.beginPath();
      for(let x=0;x<=w;x+=w/8){c.moveTo(x,0);c.lineTo(x,h)}
      for(let y=0;y<=h;y+=h/8){c.moveTo(0,y);c.lineTo(w,y)}
      c.stroke();
    } else if(this.guide==="face"){
      const cx=w/2, cy=h*.42, rx=Math.min(w*.25,h*.25), ry=rx*1.18;
      c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.stroke();
      c.beginPath();c.moveTo(cx,cy-ry*.88);c.lineTo(cx,cy+ry*.88);c.stroke();
      c.beginPath();c.moveTo(cx-rx*.82,cy-ry*.15);c.lineTo(cx+rx*.82,cy-ry*.15);c.stroke();
      c.beginPath();c.moveTo(cx-rx*.62,cy+ry*.30);c.lineTo(cx+rx*.62,cy+ry*.30);c.stroke();
      c.beginPath();c.moveTo(cx-rx*.55,cy+ry);c.quadraticCurveTo(cx,cy+ry*1.65,cx+rx*.55,cy+ry);c.stroke();
    } else if(this.guide==="figure"){
      const cx=w/2;
      c.beginPath();c.arc(cx,h*.18,h*.07,0,Math.PI*2);c.stroke();
      c.beginPath();c.moveTo(cx,h*.25);c.lineTo(cx,h*.63);c.stroke();
      c.beginPath();c.moveTo(cx,h*.34);c.lineTo(cx-w*.18,h*.48);c.moveTo(cx,h*.34);c.lineTo(cx+w*.18,h*.48);c.stroke();
      c.beginPath();c.moveTo(cx,h*.63);c.lineTo(cx-w*.13,h*.88);c.moveTo(cx,h*.63);c.lineTo(cx+w*.13,h*.88);c.stroke();
    }

    if(this.symmetry){
      c.save();c.strokeStyle="rgba(199,164,92,.48)";c.setLineDash([5,6]);
      c.beginPath();c.moveTo(w/2,10);c.lineTo(w/2,h-10);c.stroke();c.restore();
    }
  }

  render(){
    const c=this.ctx;if(!c) return;
    const w=this.logicalWidth||600,h=this.logicalHeight||520;
    c.clearRect(0,0,w,h);

    for(const stroke of this.strokes){
      const pts=stroke.points||[];if(!pts.length) continue;
      c.save();
      c.globalAlpha=stroke.opacity??1;
      c.lineCap="round";c.lineJoin="round";
      c.lineWidth=stroke.width||4;
      c.globalCompositeOperation=stroke.eraser?"destination-out":"source-over";
      c.strokeStyle=stroke.color||"#17243a";
      c.beginPath();c.moveTo(pts[0].x,pts[0].y);
      for(let i=1;i<pts.length;i++){
        const a=pts[i-1],b=pts[i];
        const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        c.quadraticCurveTo(a.x,a.y,mx,my);
      }
      c.stroke();c.restore();
    }
  }
}
