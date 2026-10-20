// MeSubo · fondo "Reñaca de noche": cielo atardecer, ciudad iluminada, mar y carreteras con estelas de luz
(function(){
  const cv=document.getElementById("road"); if(!cv) return;
  const ctx=cv.getContext("2d");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W=0,H=0,DPR=1,bg=null,lights=[],cars=[],roads=[],boost=0,lastY=scrollY,run=true;

  function seeded(s){return()=>{s=(s*9301+49297)%233280;return s/233280}}
  function bez(p,t){const u=1-t;return[
    u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],
    u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]]}
  // punto en carril: offset perpendicular escalado por perspectiva (t=0 cerca, t=1 horizonte)
  function lane(r,t,off){
    const a=bez(r.p,t),b=bez(r.p,Math.min(t+.01,1)),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
    const hw=r.w*(1-t)*(1-t)+1;return[a[0]-dy/l*off*hw,a[1]+dx/l*off*hw]}

  function build(){
    DPR=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;
    cv.width=W*DPR;cv.height=H*DPR;
    const hz=H*(+cv.dataset.hz||.5), r=seeded(7);
    roads=[
      {p:[[W*.02,H*1.08],[W*.58,H*.9],[W*.3,hz+(H-hz)*.25],[W*.6,hz]],w:Math.max(W,700)*.16},
      {p:[[W*1.08,H*1.0],[W*.82,hz+(H-hz)*.55],[W*.98,hz+(H-hz)*.2],[W*.7,hz]],w:Math.max(W,700)*.09}];
    const o=document.createElement("canvas");o.width=W*DPR;o.height=H*DPR;const c=o.getContext("2d");c.scale(DPR,DPR);
    // cielo
    let g=c.createLinearGradient(0,0,0,hz);
    g.addColorStop(0,"#140f38");g.addColorStop(.45,"#3b2470");g.addColorStop(.78,"#8e3a8f");g.addColorStop(1,"#e0568a");
    c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    g=c.createRadialGradient(W*.62,hz,0,W*.62,hz,W*.7);g.addColorStop(0,"rgba(245,135,42,.55)");g.addColorStop(1,"rgba(245,135,42,0)");
    c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    for(let i=0;i<70;i++){c.fillStyle=`rgba(255,255,255,${r()*.6})`;c.fillRect(r()*W,r()*hz*.55,1.2,1.2)}
    // tierra y mar
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,"#1d1238");g.addColorStop(1,"#0a0716");c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
    c.beginPath();c.moveTo(W*.74,hz);c.lineTo(W,hz);c.lineTo(W,H);c.bezierCurveTo(W*.9,H*.85,W*.8,hz+(H-hz)*.3,W*.74,hz);
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,"#1c4f63");g.addColorStop(1,"#06202b");c.fillStyle=g;c.fill();
    c.save();c.clip();for(let i=0;i<90;i++){const y=hz+r()*(H-hz),x=W*.74+r()*W*.3;c.fillStyle=`rgba(${r()<.5?"245,160,90":"230,90,150"},${.12+r()*.25})`;c.fillRect(x,y,8+r()*30,1.2)}c.restore();
    // cerros con luces
    lights=[];
    c.beginPath();c.moveTo(0,hz);
    for(let x=0;x<=W*.76;x+=W/40){c.lineTo(x,hz-H*.03-Math.sin(x/W*7)*H*.025-r()*H*.012)}
    c.lineTo(W*.76,hz);c.closePath();c.fillStyle="#22164a";c.fill();
    for(let i=0;i<Math.round(W/3);i++){const x=r()*W*.76,y=hz-r()*H*.05;lights.push([x,y,r()<.7?"255,196,110":"255,240,220",.8+r()*1.3,r()*6.28])}
    // casas y edificios bajos iluminados en la ladera (bajo el horizonte, fuera del mar)
    const paths=roads.map(rd=>{const p=new Path2D();for(let t=0;t<=1;t+=.02){const q=lane(rd,t,-1.5);t?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1])}
      for(let t=1;t>=0;t-=.02){const q=lane(rd,t,1.5);p.lineTo(q[0],q[1])}p.closePath();return p});
    for(let i=0;i<Math.round(W/2.5);i++){const y=hz+Math.pow(r(),1.6)*(H-hz)*.85,x=r()*W*(.74-.1*(y-hz)/(H-hz));
      if(paths.some(p=>c.isPointInPath(p,x*DPR,y*DPR)))continue;
      lights.push([x,y,r()<.65?"255,180,90":"255,235,200",.8+r()*1.6*(y-hz)/(H-hz)+.4,r()*6.28])}
    // torres (lado izquierdo, como la foto)
    for(let i=0;i<9;i++){
      const bw=W*.025+r()*W*.02,bh=H*(.08+r()*.2),bx=W*.01+i*W*.032+r()*W*.01,by=hz-bh;
      c.fillStyle="#1a1140";c.fillRect(bx,by,bw,bh+2);
      for(let yy=by+4;yy<hz-3;yy+=6)for(let xx=bx+3;xx<bx+bw-3;xx+=5)if(r()<.45)lights.push([xx,yy,r()<.8?"255,205,120":"255,250,235",1.1,r()*6.28]);
    }
    // calzada y faroles
    roads.forEach(rd=>{
      c.beginPath();for(let t=0;t<=1;t+=.02){const q=lane(rd,t,-1.15);t?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}
      for(let t=1;t>=0;t-=.02){const q=lane(rd,t,1.15);c.lineTo(q[0],q[1])}
      c.closePath();c.fillStyle="rgba(26,18,48,.75)";c.fill();
      [-1.15,1.15].forEach(s=>{c.beginPath();for(let t=0;t<=1;t+=.02){const q=lane(rd,t,s);t?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}
        c.strokeStyle="rgba(255,150,70,.35)";c.lineWidth=2;c.stroke()});
      for(let t=.02;t<.97;t+=.06){[-1.25,1.25].forEach(s=>{const q=lane(rd,t,s),rad=(1-t)*(1-t)*26+3;
        const gg=c.createRadialGradient(q[0],q[1],0,q[0],q[1],rad);gg.addColorStop(0,"rgba(255,170,70,.9)");gg.addColorStop(1,"rgba(255,140,40,0)");
        c.fillStyle=gg;c.fillRect(q[0]-rad,q[1]-rad,rad*2,rad*2)})}
    });
    bg=o;
    cars=[];
    roads.forEach((rd,ri)=>{for(let i=0;i<(ri?16:30);i++)cars.push(newCar(ri,Math.random()))});
  }
  function newCar(ri,t){
    const out=Math.random()<.5; // out = se aleja (luces rojas), in = viene (luces blancas)
    return{ri,out,t:t??(out?0:1),off:(out?.25:-.25)+(out?.4:-.4)*Math.random(),
      v:.0009+Math.random()*.0012,len:.035+Math.random()*.05}
  }
  function frame(){
    if(!run)return;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.drawImage(bg,0,0,W,H);
    const now=performance.now()/600;
    ctx.globalCompositeOperation="lighter";
    for(const l of lights){const a=.55+.45*Math.sin(now+l[4]);ctx.fillStyle=`rgba(${l[2]},${a})`;ctx.fillRect(l[0],l[1],l[3],l[3])}
    boost*=.94;
    for(const k of cars){
      const rd=roads[k.ri], sp=k.v*(1+boost)*(1.4-k.t);
      k.t+=k.out?sp:-sp;
      if(k.t>1||k.t<0){Object.assign(k,newCar(k.ri));continue}
      const col=k.out?"255,70,60":"255,245,215";
      const a=k.out?k.t-k.len*(1+boost*.5):k.t, b=k.out?k.t:k.t+k.len*(1+boost*.5);
      const pts=[];for(let i=0;i<=10;i++){const tt=Math.max(0,Math.min(1,a+(b-a)*i/10));pts.push(lane(rd,tt,k.off))}
      const wd=Math.max(.6,(1-k.t)*(1-k.t)*7);
      [[wd*3,.12],[wd,.85]].forEach(([lw,al])=>{
        ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
        ctx.strokeStyle=`rgba(${col},${al})`;ctx.lineWidth=lw;ctx.lineCap="round";ctx.stroke()});
    }
    ctx.globalCompositeOperation="source-over";
    if(!reduce)requestAnimationFrame(frame);
  }
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{build();if(reduce)frame()},150)});
  addEventListener("scroll",()=>{boost=Math.min(4,boost+Math.abs(scrollY-lastY)*.01);lastY=scrollY},{passive:true});
  document.addEventListener("visibilitychange",()=>{run=!document.hidden;if(run&&!reduce)requestAnimationFrame(frame)});
  build();
  if(reduce){for(let i=0;i<1;i++)frame()}else requestAnimationFrame(frame);
})();
