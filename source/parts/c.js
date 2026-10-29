
/* =========================================================
   Product view
   ========================================================= */
const pvEl=$('#pv'), panel=$('#pvPanel');
let lastFocus=null, pushed=false;
function money(n){ return '£'+n.toFixed(Number.isInteger(n)?0:2); }
/* ruler under the fold control: a tick every 10 mm of rear height, placed where the stand really reaches it */
function tickRuler(ticks,labels){ const at=p=>`left:calc(10px + ${p.toFixed(4)} * (100% - 20px))`; return `<div class="ruler${labels?'':' bare'}" aria-hidden="true">${ticks.map(([p,maj])=>`<i class="${maj?'maj':''}" style="${at(p)}"></i>`).join('')}${(labels||[]).map(([p,t],i,a)=>`<b class="${i===0?'first':i===a.length-1?'last':''}" style="${at(p)}">${t}</b>`).join('')}</div>`; }
let _standRuler='';
function standRuler(){
  if(_standRuler) return _standRuler;
  const oAt=h=>{ let lo=0,hi=1; for(let i=0;i<30;i++){ const m=(lo+hi)/2; rearH(m*thetaMax)<h?lo=m:hi=m; } return (lo+hi)/2; };
  const ticks=[[0,true]], labels=[[0,'22 mm']];
  for(let h=30;h<=110;h+=10){ if(h<=rearH(0)+1) continue; const o=h===110?1:oAt(h); ticks.push([o,h%50===0||h===110]); if(h===50||h===80) labels.push([o,h+'']); }
  labels.push([1,'110 mm']);
  return _standRuler=tickRuler(ticks,labels);
}
function controlHTML(id){
  if(id==='stand') return `<div class="ctrl"><div class="ctrl-top"><label for="ctl">Fold it</label><output id="ctlOut" for="ctl"></output></div><input type="range" id="ctl" min="0" max="100" step="1">${standRuler()}<div class="ends" aria-hidden="true"><span>Folded</span><span>Open</span></div><div class="seg"><button type="button" data-set="0">Folded</button><button type="button" data-set="100">Open</button><button type="button" data-lap="1" aria-pressed="false">Show a laptop on it</button></div></div>`;
  if(id==='mat') return `<div class="ctrl"><div class="ctrl-top"><label for="ctl">Roll it</label><output id="ctlOut" for="ctl"></output></div><input type="range" id="ctl" min="0" max="100" step="1">${tickRuler([...Array(11)].map((_,i)=>[i/10,i%5===0]))}<div class="ends" aria-hidden="true"><span>Flat</span><span>Rolled</span></div><p class="small" style="margin:6px 0 0">It rolls around its 350 mm edge, the way it ships.</p></div>`;
  if(id==='clips') return `<div class="ctrl"><span class="lbl" id="cabLbl">Cables in the clips</span><div class="seg" role="group" aria-labelledby="cabLbl"><button type="button" data-cab="1">1</button><button type="button" data-cab="2">2</button><button type="button" data-cab="3">3</button></div><p class="small" style="margin:8px 0 0">Each clip has three channels. Cables aren’t included.</p></div>`;
  return `<div class="ctrl"><span class="lbl">At the end of the day</span><div class="seg"><button type="button" data-away="1">Fold it away</button><button type="button" data-away="0">Set it out</button></div></div>`;
}
function buildPanel(id){
  const d=P[id];
  const price=d.was?`<b>${money(d.price)}</b><span><s>${money(d.was)}</s> separately</span>`:`<b>${money(d.price)}</b>`;
  panel.innerHTML=`
    <p class="eyebrow">${d.finish}</p>
    <h2 id="pvName" tabindex="-1"><img class="picon" src="assets/brand/icon-${({stand:'stand-open',mat:'mat-flat',clips:'clip-on',set:'desk-set'})[id]}.svg" alt="">${d.name}</h2>
    <div class="priceline">${price}<span class="stock">In stock</span><span class="small">${d.unit}</span></div>
    <p class="lead">${d.lead}</p>
    ${controlHTML(id)}
    <h3>Views</h3>
    <div class="views" role="group" aria-label="3D views">${d.views.map((v,i)=>`<button type="button" data-view="${i}" aria-pressed="${i===0}">${v[0]}</button>`).join('')}</div>
    <button class="btn add" type="button" data-add="${id}">Add to bag · ${money(d.price)}</button>
    <p class="small" style="margin-top:10px">${id==='set'?'Free delivery. Dispatched in 1–2 working days, then 2–4 working days to arrive. 30-day change-of-mind returns.':DELIVERY}</p>
    <h3>Photos</h3>
    <div class="thumbs">${d.photos.map((ph,i)=>`<button type="button" data-photo="${i}" aria-label="Open photo: ${ph[1]}"><img src="assets/photos/${ph[0]}-th.webp" alt="" width="320" height="320" loading="lazy"></button>`).join('')}</div>
    <p class="small" style="margin-top:8px">Photos are concept renders. The 3D view is built to the listed sizes.</p>
    <h3><img class="hicon" src="assets/brand/icon-know-what-fits.svg" alt="">Know what fits</h3>
    <dl class="specs">${d.specs.map(s=>`<dt>${s[0]}</dt><dd>${s[1]}</dd>`).join('')}</dl>
    <h3>Good to know</h3><p>${d.limits}</p>
    <h3><img class="hicon" src="assets/brand/icon-put-away.svg" alt="">Care</h3><p>${d.care}</p>
    <h3>${id==='set'?'In the set':'Goes with'}</h3>
    <div class="related">${d.related.map(r=>`<button type="button" data-open="${r}">${P[r].name} · ${money(P[r].price)} →</button>`).join('')}</div>`;
  syncControl();
}
let showLap=false;
function syncControl(){
  if(!pv) return;
  const ctl=panel.querySelector('#ctl'), out=panel.querySelector('#ctlOut');
  if(pv.id==='stand'&&ctl){ const o=ov.open??applied.open; ctl.value=Math.round(o*100); const h=rearH(o*thetaMax); out.textContent=o<.005?'Folded · 22 mm':`Rear height ${Math.round(h)} mm`; ctl.setAttribute('aria-valuetext',out.textContent); }
  if(pv.id==='mat'&&ctl){ const u=ov.u??applied.u; ctl.value=Math.round(u*100); out.textContent=u<.005?'Flat':(u>.995?'Rolled':Math.round(u*100)+'% rolled'); ctl.setAttribute('aria-valuetext',out.textContent); }
  panel.querySelectorAll('[data-cab]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.cab===ov.cables));
  panel.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.view===pv.view));
  panel.querySelectorAll('[data-lap]').forEach(b=>b.setAttribute('aria-pressed',showLap));
  $('#pvViewName').textContent=P[pv.id].views[pv.view][0];
}
panel.addEventListener('input',e=>{
  if(e.target.id!=='ctl') return; const v=+e.target.value/100;
  if(pv.id==='stand') ov.open=v; if(pv.id==='mat') ov.u=v; syncControl(); kick();
});
panel.addEventListener('click',e=>{
  const t=e.target.closest('button'); if(!t) return;
  if(t.dataset.view!==undefined){ pv.view=+t.dataset.view; pv.drag={az:0,polar:0}; pv.zoom=1; syncControl(); kick(); }
  else if(t.dataset.set!==undefined){ ov.open=+t.dataset.set/100; syncControl(); kick(); }
  else if(t.dataset.lap!==undefined){ showLap=!showLap; if(showLap&&(ov.open??0)<.5) ov.open=1; syncControl(); kick(); if(showLap) toast('The laptop isn’t included. It’s there to show the height.'); }
  else if(t.dataset.cab!==undefined){ ov.cables=+t.dataset.cab; syncControl(); kick(); }
  else if(t.dataset.away!==undefined){ const a=+t.dataset.away; ov.open=a?0:1; ov.u=a?1:0; kick(); }
  else if(t.dataset.add){ addToBag(t.dataset.add); }
  else if(t.dataset.photo!==undefined){ openLightbox(pv.id,+t.dataset.photo); }
  else if(t.dataset.open){ openProduct(t.dataset.open,true); }
});
function productAnchor(id){
  if(id==='set') return new THREE.Vector3(0,20,0);
  if(id==='mat'){ if(applied.u>.6){ const c=matRollCentre(applied.u); return new THREE.Vector3(c.x,c.y,c.z); } return new THREE.Vector3(0,0,0); }
  if(id==='stand') return new THREE.Vector3(stand.position.x,stand.position.y+(standKin?standKin.h*.45:10),stand.position.z-10);
  return new THREE.Vector3(-248,clipsRoot.position.y+6,CLIPZ+clipsRoot.position.z);
}
function openProduct(id,swap){
  if(!swap) lastFocus=document.activeElement;
  const st=storyState(pCur);
  ov.open=st.open; ov.u=st.matU; ov.cables=1; showLap=false;
  if(id==='set'){ ov.open=null; ov.u=null; }
  pv={id,view:0,anchor:productAnchor(id),drag:{az:0,polar:0},zoom:1};
  mode='product'; hover=null; transTarget=1;
  buildPanel(id);
  $('#bg').style.backgroundImage=`url(assets/plates/${st.eve>.5?'eve':'day'}-blur.jpg)`;
  pvEl.hidden=false; document.documentElement.classList.add('locked','pv-on');
  uiEl.inert=true; uiEl.classList.add('gone'); syncBand(id);
  if(!RM&&!SNAP){ panel.classList.remove('unfold'); void panel.offsetWidth; panel.classList.add('unfold'); }
  panel.scrollTop=0;
  if(!pushed){ history.pushState({pv:id},'','#'+id); pushed=true; } else history.replaceState({pv:id},'','#'+id);
  setTimeout(()=>$('#pvName').focus({preventScroll:true}),RM?0:350);
  kick();
}
function closeProduct(fromPop){
  if(mode!=='product') return;
  mode='story'; transTarget=0; ov.open=null; ov.u=null; ov.cables=1; showLap=false;
  pvEl.hidden=true; document.documentElement.classList.remove('locked','pv-on');
  uiEl.inert=false; uiEl.classList.remove('gone'); syncBand('desk');
  if(pushed&&!fromPop){ pushed=false; history.back(); } else pushed=false;
  if(lastFocus&&document.contains(lastFocus)) lastFocus.focus({preventScroll:true});
  kick();
}
$('#pvBack').addEventListener('click',()=>closeProduct());
addEventListener('popstate',()=>{ if(mode==='product') closeProduct(true); });
addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(!$('#lb').hidden) closeLightbox(); else closeProduct(); }
  if(e.key==='Tab'&&(mode==='product'||mode==='page')&&$('#lb').hidden){
    const f=[...pvEl.querySelectorAll('button,input,[tabindex="-1"]'),...$('#band').querySelectorAll('button')].filter(x=>x.offsetParent!==null);
    if(!f.length) return; const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  if(!$('#lb').hidden){ if(e.key==='ArrowRight') lbStep(1); if(e.key==='ArrowLeft') lbStep(-1); }
});

/* the band: every section in plain words */
function syncBand(cur){ document.querySelectorAll('#band [data-go],#band [data-open]').forEach(b=>{ const k=b.dataset.go||b.dataset.open; if(k===cur) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }); }
$('#band').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b||b.id==='bagChip') return;
  if(b.dataset.open){ if(mode==='product') openProduct(b.dataset.open,true); else openProduct(b.dataset.open); return; }
  const g=b.dataset.go;
  if(g==='desk'){ if(mode==='product') closeProduct(); else goToP(0); return; }
  if(typeof openPage==='function') openPage(g); else toast('That page arrives in the next build step.');
});
/* lightbox */
let lbState=null;
function openLightbox(id,i){ lbState={id,i}; $('#lb').hidden=false; lbShow(); $('#lbClose').focus(); }
function lbShow(){ const ph=P[lbState.id].photos[lbState.i]; const img=$('#lbImg'); img.src='assets/photos/'+ph[0]+'.webp'; img.alt=ph[1]; $('#lbCap').textContent=`${ph[1]} Photo ${lbState.i+1} of ${P[lbState.id].photos.length}.`; }
function lbStep(d){ const n=P[lbState.id].photos.length; lbState.i=(lbState.i+d+n)%n; lbShow(); }
function closeLightbox(){ $('#lb').hidden=true; const b=panel.querySelector(`[data-photo="${lbState.i}"]`); if(b) b.focus(); }
$('#lbClose').addEventListener('click',closeLightbox); $('#lbPrev').addEventListener('click',()=>lbStep(-1)); $('#lbNext').addEventListener('click',()=>lbStep(1));
$('#lb').addEventListener('click',e=>{ if(e.target.id==='lb') closeLightbox(); });

/* bag */
const bag=[];
function addToBag(id){
  bag.push(id);
  const sub=bag.reduce((s,k)=>s+P[k].price,0), n=bag.length;
  $('#bagChip').textContent=`Bag · ${n} · ${money(sub)}`; $('#bagChip').classList.add('has'); $('#bagChip').setAttribute('aria-label',`Bag, ${n} item${n>1?'s':''}, ${money(sub)}`);
  toast(sub>=75?`${P[id].name} added. Bag ${money(sub)}, delivery is free.`:`${P[id].name} added. Bag ${money(sub)}. ${money(75-sub)} more for free delivery.`,true);
}
$('#bagChip').addEventListener('click',()=>{
  if(!bag.length){ toast('Your bag is empty. Open a product on the desk to add it.'); return; }
  const sub=bag.reduce((s,k)=>s+P[k].price,0), del=sub>=75?0:4.95;
  toast(`${bag.length} item${bag.length>1?'s':''} · ${money(sub)} + delivery ${del?money(del):'free'}. Checkout isn’t part of this prototype.`);
});
let toastT=0;
function toast(m,folded){ const t=$('#toast'); t.innerHTML=(folded?'<span class="fold" aria-hidden="true"></span>':'')+m; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),3800); }

/* =========================================================
   Pointer
   ========================================================= */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function isVisibleDeep(o){ while(o){ if(!o.visible) return false; o=o.parent; } return true; }
function pick(e){
  ndc.set(e.clientX/size.w*2-1,-(e.clientY/size.h)*2+1); ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObjects(PICK.filter(m=>isVisibleDeep(m)),false)[0];
  const id=hit?hit.object.userData.prod:null; return id==='laptop'?'stand':id;
}
let down=null;
canvas.addEventListener('pointerdown',e=>{
  down={x:e.clientX,y:e.clientY,moved:false};
  if(mode==='product'){ canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); }
});
canvas.addEventListener('pointermove',e=>{
  if(mode==='product'&&down){
    const dx=e.clientX-down.x, dy=e.clientY-down.y; if(Math.abs(dx)+Math.abs(dy)>3) down.moved=true;
    pv.drag.az-=dx*.35; pv.drag.polar-=dy*.3; down.x=e.clientX; down.y=e.clientY; kick(); return;
  }
  if(mode==='story'&&EXPLORE(pCur)&&e.pointerType!=='touch'){ const h=pick(e); if(h!==hover){ hover=h; kick(); } canvas.classList.toggle('hot',!!h); }
});
addEventListener('pointerup',e=>{
  if(!down) return;
  const moved=down.moved||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6;
  canvas.classList.remove('dragging');
  if(mode==='story'&&!moved&&e.target===canvas&&EXPLORE(pCur)){ const h=pick(e); if(h) openProduct(h); }
  down=null;
});
canvas.addEventListener('wheel',e=>{ if(mode!=='product') return; e.preventDefault(); pv.zoom=clamp(pv.zoom*Math.exp(e.deltaY*.0012),.45,1.8); kick(); },{passive:false});

/* =========================================================
   Frame loop
   ========================================================= */
const HL=new THREE.Color();
const matsOf={mat:[feltMat,feltEdgeMat],stand:[ALU,PAD,RUB,STEEL],clips:[CLIP,CABLE,CABLE2,CABLE3]};
const prodMats=[feltMat,feltEdgeMat,ALU,PAD,RUB,STEEL,CLIP,CABLE];
const hlCur={mat:0,stand:0,clips:0};
let awake=3;
function kick(){ awake=Math.max(awake,SNAP?3:45); }
function smooth(cur,target,k,dt){ return (RM||SNAP)?target:cur+(target-cur)*(1-Math.exp(-k*dt)); }
function fadeGroup(mats,op){ for(const m of mats){ m.transparent=op<.999; m.opacity=op; } }
function sceneState(s,dt){
  const prod=mode==='product'||trans>0;
  // mat: set down rolled, then unrolled
  const u=ov.u??s.matU; applied.u=smooth(applied.u,u,prod?7:30,dt);
  const mIn=prod?1:s.matIn; matGroup.visible=mIn>0.001; matGroup.position.y=(1-mIn)*50; fadeGroup([feltMat,feltEdgeMat],sstep(0,.7,mIn));
  setMatRoll(clamp(applied.u,0,1));
  // stand
  const o=ov.open??s.open; applied.open=smooth(applied.open,o,prod?7:30,dt);
  const sIn=prod?1:s.standIn; stand.visible=sIn>0.001; stand.position.set(ST.x0,3+(1-sIn)*60,ST.z0); fadeGroup([ALU,PAD,RUB,STEEL],sstep(0,.7,sIn));
  setStandOpen(clamp(applied.open,0,1));
  const lapT=prod?(showLap?1:0):s.lapIn; applied.lap=smooth(applied.lap??0,lapT,8,dt);
  placeLaptop(applied.lap,prod?(showLap?1:0):s.lid);
  // clips
  const cIn=prod?1:s.clipsIn; clipsRoot.visible=cIn>0.001; clipsArrive.position.y=(1-cIn)*40; fadeGroup([CLIP],sstep(0,.7,cIn));
  draw(cable1,prod?1:s.cable); connector.visible=prod||s.cable>.98;
  applied.c2=smooth(applied.c2,ov.cables>=2?1:0,4,dt); applied.c3=smooth(applied.c3,ov.cables>=3?1:0,4,dt);
  draw(cable2,applied.c2); draw(cable3,applied.c3);
  // rolling the mat: everything standing on it lifts off and fades, then comes back when it unrolls
  const lift=(prod&&pv&&(pv.id==='mat'||pv.id==='set'))?sstep(.02,.3,applied.u):0;
  if(lift>0){ stand.position.y+=lift*45; fadeGroup([ALU,PAD,RUB,STEEL],1-lift); stand.visible=lift<.995;
    clipsRoot.position.y=lift*30; fadeGroup([CLIP,CABLE,CABLE2,CABLE3],1-lift); clipsRoot.visible=lift<.995; }
  else { clipsRoot.position.y=0; fadeGroup([CABLE,CABLE2,CABLE3],1); }
  // light: photographed day -> evening
  const eve=s.eve;
  plateMat.uniforms.mixE.value=eve;
  key.intensity=lerp(CAL.keyI,CAL.keyI*.28,eve); key.color.setRGB(1,.97,.93).lerp(HL.setRGB(.62,.7,1),eve);
  lamp.intensity=lerp(0,CAL.lampI,eve);
  for(const m of prodMats.concat(lapMats)) m.envMapIntensity=(m.userData.env??(m.userData.env=m.envMapIntensity))*lerp(1,.6,eve);
  renderer.toneMappingExposure=lerp(1.7,1.6,eve); // match the photo's exposure
  for(const id in hlCur){ hlCur[id]=smooth(hlCur[id],hover===id?1:0,10,dt); for(const m of matsOf[id]) m.emissive.setScalar(hlCur[id]*(id==='mat'?0:.018)); }
}
let lastNow=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-lastNow)/1000); lastNow=now;
  const pPrev=pCur; pCur=smooth(pCur,pTarget,9,dt); if(Math.abs(pCur-pTarget)<1e-5) pCur=pTarget;
  if(Math.abs(pCur-pPrev)>1e-6) kick();
  const tPrev=trans; trans=(RM||SNAP)?transTarget:clamp(trans+(transTarget>trans?1:-1)*dt/1.0,0,1); if(trans!==tPrev) kick();
  if(awake>0){
    awake--;
    const s=storyState(pCur);
    let si=0; for(let i=0;i<STEPS.length;i++) if(pCur>=STEPS[i].at) si=i; setStep(si);
    sceneState(s,dt);
    if(pv){ const tg=productOrbitTarget(); for(const k of ['tx','ty','tz','polar']) orbit[k]=smooth(orbit[k],tg[k],6,dt);
      let da=((tg.az-orbit.az+540)%360)-180; orbit.az=(RM||SNAP)?tg.az:orbit.az+da*(1-Math.exp(-6*dt)); orbit.W=Math.exp(smooth(Math.log(orbit.W),Math.log(tg.W),6,dt));
      if(Math.abs(orbit.W-tg.W)/tg.W>.002||Math.abs(orbit.polar-tg.polar)>.05||Math.abs(da)>.05) kick(); }
    if(trans===0&&mode==='story'&&pv){ pv=null; }
    applyCamera();
    renderContact();
    syncPlate();
    renderer.setRenderTarget(null); renderer.clear();
    if(plate.visible) renderer.render(bgScene,camera);
    renderer.clearDepth();
    renderer.render(scene,camera);
    overlays();
    if(Math.abs(applied.open-(ov.open??s.open))>.002||Math.abs(applied.u-(ov.u??s.matU))>.002) kick();
    for(const id in hlCur) if(Math.abs(hlCur[id]-(hover===id?1:0))>.01) kick();
  }
  requestAnimationFrame(frame);
}
function overlays(){
  const story=mode==='story'&&trans===0, p=pCur;
  let m;
  if(p<.48) m=8*60+55+Math.floor(ramp(p,0,.48)*5); else if(p<.70) m=540; else if(p<.76) m=540+Math.floor(ramp(p,.70,.76)*538); else if(p<.86) m=1079; else m=1080;
  $('#clock').textContent=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  // caption: on the wall, on the side away from the product it talks about
  const st=STEPS[stepIdx];
  if(!mobile()){
    const ch=capEl.offsetHeight, cw=capEl.offsetWidth;
    let side='L';
    if(st.anchor){ const a=anchorOf(st.anchor), sc=toScreen(a.x,a.y,a.z); side=sc[0]<size.w*.5?'R':'L'; }
    const wallY=toScreen(0,0,-300)[1];
    const top=clamp(Math.min(72, wallY-ch-24),64,size.h-ch-24);
    capEl.style.top=top+'px'; capEl.style.left=(side==='R'?size.w-cw-28:28)+'px';
  } else { capEl.style.top=''; capEl.style.left=''; }
  // pins
  const ex=story&&EXPLORE(p);
  for(const id of PIN_IDS){
    const b=pins[id]; let show=ex;
    if(id==='laptop') show=ex&&laptop.visible&&applied.lap>.9;
    const a=anchorOf(id), sc=toScreen(a.x,a.y,a.z);
    b.classList.toggle('hide',!show||!sc[2]); b.tabIndex=show?0:-1; b.setAttribute('aria-hidden',show?'false':'true');
    b.style.left=sc[0]+'px'; b.style.top=sc[1]+'px';
    if(show){ const sp=b.firstElementChild, half=sp.offsetWidth/2; let dx=0; if(sc[0]-half<8) dx=8-(sc[0]-half); else if(sc[0]+half>size.w-8) dx=size.w-8-(sc[0]+half); sp.style.transform=`translateX(${dx.toFixed(1)}px)`; }
  }
  // dimension lines
  let o='';
  if(story){
    const ln=(a,b,w=1.5)=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="rgba(0,0,0,.45)" stroke-width="${w+2.5}"/><line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#fff" stroke-width="${w}"/>`;
    const tx=(pt,str,dy=0)=>{ const w=str.length*7.4; const x=clamp(pt[0]-w/2,8,size.w-8-w), y=clamp(pt[1]+dy,64,size.h-8); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${str}</text>`; };
    const S=(x,y,z)=>toScreen(x,y,z);
    const am=ramp(p,.15,.17)*(1-ramp(p,.205,.225));
    if(am>0){ const y=3,z=175+24,a=S(-350,y,z),b=S(350,y,z); let g=ln(a,b);
      for(let i=0;i<=7;i++){ g+=ln(S(-350+i*100,y,z),S(-350+i*100,y,z-(i%7===0?16:9))); }
      g+=tx([(a[0]+b[0])/2,(a[1]+b[1])/2],'700 mm',20);
      const c=S(350+24,y,-175), d=S(350+24,y,175); g+=ln(c,d)+ln(c,S(350+10,y,-175))+ln(d,S(350+10,y,175)); g+=tx([(c[0]+d[0])/2+38,(c[1]+d[1])/2],'350 mm',4);
      o+=`<g opacity="${am.toFixed(3)}">${g}</g>`; }
    const as=ramp(p,.26,.28)*(1-ramp(p,.355,.37));
    if(as>0&&standKin){ const x=stand.position.x+152+34, z=stand.position.z+ST.front-standKin.R[0], y0=stand.position.y, h=standKin.h;
      const a=S(x,y0,z), b=S(x,y0+h,z); let g=ln(a,b)+ln(S(x-8,y0,z),S(x+8,y0,z))+ln(S(x-8,y0+h,z),S(x+8,y0+h,z));
      g+=tx([(a[0]+b[0])/2+42,(a[1]+b[1])/2],`${Math.round(h)} mm`,4); o+=`<g opacity="${as.toFixed(3)}">${g}</g>`; }
    const ac=ramp(p,.425,.44)*(1-ramp(p,.465,.48));
    if(ac>0){ const x=-222+16,y=3+12+4,a=S(x,y,CLIPZ-22),b=S(x,y,CLIPZ+22); let g=ln(a,b)+ln(S(x-3,y,CLIPZ-22),S(x+3,y,CLIPZ-22))+ln(S(x-3,y,CLIPZ+22),S(x+3,y,CLIPZ+22));
      g+=tx([b[0]+34,b[1]],'44 mm',4); const c=S(-274,16,CLIPZ), d=S(-300,70,CLIPZ-40); g+=ln(c,d)+tx([d[0],d[1]],'3 channels',-8); o+=`<g opacity="${ac.toFixed(3)}">${g}</g>`; }
  }
  dimsEl.innerHTML=o;
}

/* =========================================================
   Scroll + resize + start
   ========================================================= */
function readScroll(){
  const tr=$('#track'), max=tr.offsetHeight-innerHeight;
  pTarget=clamp((scrollY-tr.offsetTop)/max,0,1);
  uiEl.classList.toggle('gone',scrollY>tr.offsetTop+max+innerHeight*.35||mode==='product'||mode==='page');
  kick();
}
function resize(){
  size.w=innerWidth; size.h=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.6:1.75));
  renderer.setSize(size.w,size.h,false);
  dimsEl.setAttribute('viewBox',`0 0 ${size.w} ${size.h}`);
  kick();
}
addEventListener('scroll',()=>{ if(mode==='story') readScroll(); },{passive:true});
addEventListener('resize',()=>{ resize(); readScroll(); });
manager.onLoad=()=>{
  resize(); readScroll(); pCur=pTarget;
  const s0=storyState(pCur); applied.open=s0.open; applied.u=s0.matU;
  setStep(0);
  $('#loader').classList.add('done'); setTimeout(()=>$('#loader').remove(),600);
  kick(); requestAnimationFrame(frame);
  const h=location.hash.slice(1); if(P[h]){ goToP(.6); setTimeout(()=>openProduct(h),RM?0:900); }
};
</script>
</body>
</html>
