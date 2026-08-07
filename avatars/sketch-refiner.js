function dist(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0))}

export function removeAccidentalStrokes(strokes=[],{
  minPoints=3,minLength=8
}={}) {
  return strokes.filter(stroke=>{
    const pts=stroke.points||[];
    if(pts.length<minPoints) return false;
    let length=0;
    for(let i=1;i<pts.length;i++) length+=dist(pts[i-1],pts[i]);
    return length>=minLength;
  });
}

export function movingAverage(points=[],radius=2) {
  if(points.length<3) return points.map(p=>({...p}));
  return points.map((point,index)=>{
    let x=0,y=0,n=0;
    const lo=Math.max(0,index-radius);
    const hi=Math.min(points.length-1,index+radius);
    for(let i=lo;i<=hi;i++){x+=points[i].x;y+=points[i].y;n++}
    return {...point,x:x/n,y:y/n};
  });
}

export function simplify(points=[],tolerance=1.35) {
  if(points.length<=2) return points.map(p=>({...p}));

  function lineDist(p,a,b){
    const dx=b.x-a.x,dy=b.y-a.y;
    if(dx===0&&dy===0) return dist(p,a);
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
  }

  function rdp(pts){
    if(pts.length<=2) return pts;
    let max=0,index=0;
    const first=pts[0],last=pts[pts.length-1];
    for(let i=1;i<pts.length-1;i++){
      const d=lineDist(pts[i],first,last);
      if(d>max){max=d;index=i}
    }
    if(max>tolerance){
      const left=rdp(pts.slice(0,index+1));
      const right=rdp(pts.slice(index));
      return left.slice(0,-1).concat(right);
    }
    return [first,last];
  }

  return rdp(points);
}

export function chaikin(points=[],iterations=2) {
  let current=points.map(p=>({...p}));
  for(let k=0;k<iterations;k++){
    if(current.length<3) break;
    const next=[current[0]];
    for(let i=0;i<current.length-1;i++){
      const a=current[i],b=current[i+1];
      next.push(
        {x:.75*a.x+.25*b.x,y:.75*a.y+.25*b.y},
        {x:.25*a.x+.75*b.x,y:.25*a.y+.75*b.y}
      );
    }
    next.push(current[current.length-1]);
    current=next;
  }
  return current;
}

export function refineSketch(strokes=[],{
  smoothRadius=2,
  curveIterations=2,
  simplifyTolerance=1.15,
  uniformWidth=false
}={}) {
  return removeAccidentalStrokes(strokes).map(stroke=>{
    let pts=movingAverage(stroke.points||[],smoothRadius);
    pts=simplify(pts,simplifyTolerance);
    pts=chaikin(pts,curveIterations);
    return {
      ...stroke,
      width: uniformWidth ? 3 : Math.max(1,Math.min(18,Number(stroke.width)||3)),
      opacity: Math.max(.1,Math.min(1,Number(stroke.opacity)||1)),
      points:pts
    };
  });
}

export function mirrorStroke(stroke={},axisX=300) {
  return {
    ...stroke,
    mirrored:true,
    points:(stroke.points||[]).map(p=>({...p,x:axisX+(axisX-p.x)}))
  };
}

export function strokesToSvg(strokes=[],{
  width=600,height=520,background="#fffdf8"
}={}) {
  const safeBg=String(background||"#fffdf8").replace(/[<>"']/g,"");
  const paths=strokes.map(stroke=>{
    const pts=stroke.points||[];
    if(!pts.length) return "";
    const d=pts.map((p,i)=>`${i?"L":"M"} ${Number(p.x).toFixed(2)} ${Number(p.y).toFixed(2)}`).join(" ");
    const color=String(stroke.color||"#17243a").replace(/[<>"']/g,"");
    const sw=Math.max(1,Math.min(18,Number(stroke.width)||3));
    const opacity=Math.max(.1,Math.min(1,Number(stroke.opacity)||1));
    return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${safeBg}"/>${paths}</svg>`;
}
