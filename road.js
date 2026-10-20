// MeSubo · fondo animado nocturno con carreteras y estelas de luz
// data-scene: "costa" (Reñaca) · "santiago" (skyline + cordillera) · "viaje" (pasa de costa a Santiago con el scroll)
(function(){
  const cv=document.getElementById("road"); if(!cv) return;
  const ctx=cv.getContext("2d");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene=cv.dataset.scene||"costa";
  let W=0,H=0,DPR=1,hz=0,layers={},cars=[],roads=[],boost=0,lastY=scrollY,run=true;

  function seeded(s){return()=>{s=(s*9301+49297)%233280;return s/233280}}
  function bez(p,t){const u=1-t;return[
    u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],
    u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]]}
  // punto en carril: offset perpendicular escalado por perspectiva (t=0 cerca, t=1 horizonte)
  function lane(r,t,off){
    const a=bez(r.p,t),b=bez(r.p,Math.min(t+.01,1)),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
    const hw=r.w*(1-t)*(1-t)+1;return[a[0]-dy/l*off*hw,a[1]+dx/l*off*hw]}
  function roadPaths(){return roads.map(rd=>{const p=new Path2D();for(let t=0;t<=1;t+=.02){const q=lane(rd,t,-1.5);t?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1])}
    for(let t=1;t>=0;t-=.02){const q=lane(rd,t,1.5);p.lineTo(q[0],q[1])}p.closePath();return p})}
  function newLayer(){const o=document.createElement("canvas");o.width=W*DPR;o.height=H*DPR;const c=o.getContext("2d");c.scale(DPR,DPR);return[o,c]}
  function windows(L,c,r,bx,by,bw,bh,warm){for(let yy=by+4;yy<hz-3;yy+=6)for(let xx=bx+3;xx<bx+bw-3;xx+=5)if(r()<.45)L.push([xx,yy,r()<warm?"255,205,120":"240,245,255",1.1,r()*6.28,0])}
  function valley(L,c,r,maxX){const paths=roadPaths();
    for(let i=0;i<Math.round(W/2.2);i++){const y=hz+Math.pow(r(),1.6)*(H-hz)*.85,x=r()*W*maxX(y);
      if(paths.some(p=>c.isPointInPath(p,x*DPR,y*DPR)))continue;
      L.push([x,y,r()<.65?"255,180,90":"255,235,200",.8+r()*1.6*(y-hz)/(H-hz)+.4,r()*6.28,0])}}
  function drawRoads(c){
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
  }

  // ── Escena costa: Reñaca (cielo atardecer, cerros, torres, mar)
  function costa(){
    const[o,c]=newLayer(),r=seeded(7),L=[];
    let g=c.createLinearGradient(0,0,0,hz);
    g.addColorStop(0,"#140f38");g.addColorStop(.45,"#3b2470");g.addColorStop(.78,"#8e3a8f");g.addColorStop(1,"#e0568a");
    c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    g=c.createRadialGradient(W*.62,hz,0,W*.62,hz,W*.7);g.addColorStop(0,"rgba(245,135,42,.55)");g.addColorStop(1,"rgba(245,135,42,0)");
    c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    for(let i=0;i<70;i++){c.fillStyle=`rgba(255,255,255,${r()*.6})`;c.fillRect(r()*W,r()*hz*.55,1.2,1.2)}
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,"#1d1238");g.addColorStop(1,"#0a0716");c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
    c.beginPath();c.moveTo(W*.74,hz);c.lineTo(W,hz);c.lineTo(W,H);c.bezierCurveTo(W*.9,H*.85,W*.8,hz+(H-hz)*.3,W*.74,hz);
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,"#1c4f63");g.addColorStop(1,"#06202b");c.fillStyle=g;c.fill();
    c.save();c.clip();for(let i=0;i<90;i++){const y=hz+r()*(H-hz),x=W*.74+r()*W*.3;c.fillStyle=`rgba(${r()<.5?"245,160,90":"230,90,150"},${.12+r()*.25})`;c.fillRect(x,y,8+r()*30,1.2)}c.restore();
    c.beginPath();c.moveTo(0,hz);
    for(let x=0;x<=W*.76;x+=W/40){c.lineTo(x,hz-H*.03-Math.sin(x/W*7)*H*.025-r()*H*.012)}
    c.lineTo(W*.76,hz);c.closePath();c.fillStyle="#22164a";c.fill();
    for(let i=0;i<Math.round(W/3);i++){const x=r()*W*.76,y=hz-r()*H*.05;L.push([x,y,r()<.7?"255,196,110":"255,240,220",.8+r()*1.3,r()*6.28,0])}
    valley(L,c,r,y=>.74-.1*(y-hz)/(H-hz));
    for(let i=0;i<9;i++){const bw=W*.025+r()*W*.02,bh=H*(.08+r()*.2),bx=W*.01+i*W*.032+r()*W*.01,by=hz-bh;
      c.fillStyle="#1a1140";c.fillRect(bx,by,bw,bh+2);windows(L,c,r,bx,by,bw,bh,.8)}
    drawRoads(c);
    return{img:o,lights:L};
  }

  // ── Escena Santiago: cordillera nevada con luna, skyline (Costanera, Titanium, Entel) y valle iluminado
  function santiago(){
    const[o,c]=newLayer(),r=seeded(21),L=[];
    let g=c.createLinearGradient(0,0,0,hz);
    g.addColorStop(0,"#0d0b2e");g.addColorStop(.5,"#2a1d5c");g.addColorStop(.85,"#7a3a7f");g.addColorStop(1,"#d8664f");
    c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    for(let i=0;i<90;i++){c.fillStyle=`rgba(255,255,255,${r()*.7})`;c.fillRect(r()*W,r()*hz*.5,1.2,1.2)}
    // luna
    const mx=W*.82,my=hz*.22,mr=Math.max(14,W*.018);
    g=c.createRadialGradient(mx,my,0,mx,my,mr*6);g.addColorStop(0,"rgba(255,245,220,.35)");g.addColorStop(1,"rgba(255,245,220,0)");c.fillStyle=g;c.fillRect(mx-mr*6,my-mr*6,mr*12,mr*12);
    c.fillStyle="#f6f0dc";c.beginPath();c.arc(mx,my,mr,0,7);c.fill();
    // cordillera de los Andes con nieve iluminada por la luna
    const peaks=[];for(let x=-W*.05;x<=W*1.05;x+=W/14)peaks.push([x+r()*W*.03,hz-H*(.12+r()*.14)]);
    c.beginPath();c.moveTo(-10,hz);
    peaks.forEach((p,i)=>{c.lineTo(p[0],p[1]);if(i<peaks.length-1){const n=peaks[i+1];c.lineTo((p[0]+n[0])/2,hz-H*(.05+r()*.05))}});
    c.lineTo(W+10,hz);c.closePath();
    g=c.createLinearGradient(0,hz-H*.26,0,hz);g.addColorStop(0,"#3a3170");g.addColorStop(1,"#1f1846");c.fillStyle=g;c.fill();
    peaks.forEach(p=>{const s=H*.035+r()*H*.02;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]-s*1.3,p[1]+s);c.lineTo(p[0]-s*.4,p[1]+s*.75);c.lineTo(p[0]+s*.2,p[1]+s*1.05);c.lineTo(p[0]+s*1.2,p[1]+s);c.closePath();
      c.fillStyle="rgba(214,210,240,.55)";c.fill()});
    // halo de la ciudad
    g=c.createRadialGradient(W*.55,hz,0,W*.55,hz,W*.6);g.addColorStop(0,"rgba(255,140,60,.45)");g.addColorStop(1,"rgba(255,140,60,0)");c.fillStyle=g;c.fillRect(0,0,W,hz+1);
    // valle
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,"#1a1236");g.addColorStop(1,"#09061a");c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
    // edificios genéricos
    for(let x=W*.08;x<W*.95;){const bw=W*(.012+r()*.022),bh=H*(.025+Math.pow(r(),2)*.12)*(1-Math.abs(x/W-.55)*.9),by=hz-bh;
      c.fillStyle=r()<.5?"#191138":"#1e1542";c.fillRect(x,by,bw,bh+2);windows(L,c,r,x,by,bw,bh,.7);x+=bw+r()*W*.006}
    const top=(x,y)=>L.push([x,y,"255,40,40",2.4,r()*6.28,1]);
    // Torre Entel: fuste delgado, disco y antena
    const ex=W*.36,eb=H*.17;c.fillStyle="#1b1340";c.fillRect(ex-W*.004,hz-eb,W*.008,eb);
    c.beginPath();c.ellipse(ex,hz-eb*.82,W*.012,H*.008,0,0,7);c.fill();c.fillRect(ex-1,hz-eb-H*.04,2,H*.04);top(ex,hz-eb-H*.04);
    for(let y=hz-eb*.82;y<hz;y+=7)L.push([ex,y,"190,220,255",1,r()*6.28,0]);
    // Titanium La Portada: torre con techo inclinado
    const tx=W*.63,tw=W*.03,th=H*.22;c.fillStyle="#1c1444";c.beginPath();c.moveTo(tx,hz);c.lineTo(tx,hz-th*.9);c.lineTo(tx+tw,hz-th);c.lineTo(tx+tw,hz);c.closePath();c.fill();
    windows(L,c,r,tx,hz-th*.9,tw,th*.9,.4);top(tx+tw,hz-th);
    // Gran Torre Costanera: la más alta, se angosta y termina en corona abierta
    const cx=W*.55,cb=W*.034,ct=W*.022,chh=Math.min(H*.36,hz*.78);
    c.fillStyle="#1d1547";c.beginPath();c.moveTo(cx-cb/2,hz);c.lineTo(cx-ct/2,hz-chh);c.lineTo(cx+ct/2,hz-chh);c.lineTo(cx+cb/2,hz);c.closePath();c.fill();
    for(let y=hz-chh+6;y<hz-3;y+=5){const k=(hz-y)/chh,half=(cb+(ct-cb)*k)/2-3;for(let x=cx-half;x<cx+half;x+=4)if(r()<.55)L.push([x,y,r()<.5?"170,210,255":"255,225,170",1,r()*6.28,0])}
    c.strokeStyle="#2a2060";c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(cx+i*ct/5,hz-chh);c.lineTo(cx+i*ct/4,hz-chh-H*.025);c.stroke()}
    // corona iluminada (como en fechas especiales)
    g=c.createLinearGradient(0,hz-chh-H*.03,0,hz-chh+H*.02);g.addColorStop(0,"rgba(217,70,138,0)");g.addColorStop(1,"rgba(217,70,138,.55)");c.fillStyle=g;c.fillRect(cx-ct,hz-chh-H*.03,ct*2,H*.05);
    top(cx,hz-chh-H*.025);
    valley(L,c,r,()=>1);
    drawRoads(c);
    return{img:o,lights:L};
  }

  function build(){
    DPR=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;
    cv.width=W*DPR;cv.height=H*DPR;hz=H*(+cv.dataset.hz||.5);
    roads=[
      {p:[[W*.02,H*1.08],[W*.58,H*.9],[W*.3,hz+(H-hz)*.25],[W*.6,hz]],w:Math.min(Math.max(W,700)*.16,(H-hz)*1.1)},
      {p:[[W*1.08,H*1.0],[W*.82,hz+(H-hz)*.55],[W*.98,hz+(H-hz)*.2],[W*.7,hz]],w:Math.min(Math.max(W,700)*.09,(H-hz)*.6)}];
    layers={};
    if(scene!=="santiago")layers.costa=costa();
    if(scene!=="costa")layers.santiago=santiago();
    cars=[];roads.forEach((rd,ri)=>{for(let i=0;i<(ri?16:30);i++)cars.push(newCar(ri,Math.random()))});
  }
  function newCar(ri,t){
    const out=Math.random()<.5; // out = se aleja (luces rojas), in = viene (luces blancas)
    return{ri,out,t:t??(out?0:1),off:(out?.25:-.25)+(out?.4:-.4)*Math.random(),v:.0009+Math.random()*.0012,len:.035+Math.random()*.05}
  }
  // mezcla de escenas en modo viaje: 0 = costa, 1 = Santiago
  function mix(){
    if(scene==="costa")return 0; if(scene==="santiago")return 1;
    const h=document.documentElement,pr=h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight);
    const k=Math.min(1,Math.max(0,(pr-.4)/.3));return k*k*(3-2*k);
  }
  function drawLights(L,a0,now){
    for(const l of L){let a=l[5]?(Math.sin(now*2.2+l[4])>.55?1:.12):.55+.45*Math.sin(now+l[4]);
      ctx.fillStyle=`rgba(${l[2]},${a*a0})`;ctx.fillRect(l[0],l[1],l[3],l[3])}}
  function frame(){
    if(!run)return;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const k=mix(),now=performance.now()/600;
    if(layers.costa&&k<1){ctx.globalAlpha=1;ctx.drawImage(layers.costa.img,0,0,W,H)}
    if(layers.santiago&&k>0){ctx.globalAlpha=k;ctx.drawImage(layers.santiago.img,0,0,W,H)}
    ctx.globalAlpha=1;ctx.globalCompositeOperation="lighter";
    if(layers.costa&&k<1)drawLights(layers.costa.lights,1-k,now);
    if(layers.santiago&&k>0)drawLights(layers.santiago.lights,k,now);
    boost*=.94;
    for(const c of cars){
      const rd=roads[c.ri],sp=c.v*(1+boost)*(1.4-c.t);
      c.t+=c.out?sp:-sp;
      if(c.t>1||c.t<0){Object.assign(c,newCar(c.ri));continue}
      const col=c.out?"255,70,60":"255,245,215";
      const a=c.out?c.t-c.len*(1+boost*.5):c.t,b=c.out?c.t:c.t+c.len*(1+boost*.5);
      const pts=[];for(let i=0;i<=10;i++){const tt=Math.max(0,Math.min(1,a+(b-a)*i/10));pts.push(lane(rd,tt,c.off))}
      const wd=Math.max(.6,(1-c.t)*(1-c.t)*7);
      [[wd*3,.12],[wd,.85]].forEach(([lw,al])=>{
        ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
        ctx.strokeStyle=`rgba(${col},${al})`;ctx.lineWidth=lw;ctx.lineCap="round";ctx.stroke()});
    }
    ctx.globalCompositeOperation="source-over";
    if(!reduce)requestAnimationFrame(frame);
  }
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{build();if(reduce)frame()},150)});
  addEventListener("scroll",()=>{boost=Math.min(4,boost+Math.abs(scrollY-lastY)*.01);lastY=scrollY;if(reduce)frame()},{passive:true});
  document.addEventListener("visibilitychange",()=>{run=!document.hidden;if(run&&!reduce)requestAnimationFrame(frame)});
  build();
  reduce?frame():requestAnimationFrame(frame);
})();
