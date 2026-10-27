
/* =========================================================
   R12: smooth and fast, readable without blur, a cozy intro,
   "play the day", credit, About disclaimers and Contact.
   (inserted inside d.js's scope after e.js by build2.py)
   ========================================================= */
{
const CFG=Object.assign({designer:'Yas Dastan',email:'yas002dastan@gmail.com',website:'https://your-website.example'},window.FOLD_SITE||{});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const siteLabel=CFG.website.replace(/^https?:\/\//,'').replace(/\/$/,'');

/* ---------- 1. rendering fixes ---------- */
// hover glow lives in c.js now: none on the felt, a faint lift on stand and clips
// the 3D desk melts into the background at its edges, so zooming out never shows a hard slab edge
{ const c=document.createElement('canvas'); c.width=256; c.height=128; const g=c.getContext('2d');
  g.fillStyle='#000'; g.fillRect(0,0,256,128);
  for(let i=0;i<=40;i++){ const t=i/40, v=Math.round(255*Math.pow(t,1.6)); g.fillStyle=`rgb(${v},${v},${v})`; const ix=t*70, iy=t*30; g.fillRect(ix,iy,256-2*ix,128-2*iy); }
  const am=new THREE.CanvasTexture(c); deskMat.alphaMap=am; deskMat.needsUpdate=true;
  // a flat top only: no side faces to catch the light when you zoom out
  desk3d.geometry.dispose(); desk3d.geometry=new THREE.PlaneGeometry(1200,600).rotateX(-Math.PI/2).translate(0,12.05,0); }
// views that magnified simple geometry or looked along the desk surface
P.stand.views=P.stand.views.map(v=>v[0]==='Hinge'?['Hinge',{W:200,polar:66,az:-70,at:'hinge'}]:v);
P.clips.views=P.clips.views.map(v=>v[0]==='Along the cable'?['Along the cable',{W:150,polar:62,az:90}]:v);
// zoom out only as far as the desk still fills the view
canvas.addEventListener('wheel',e=>{ if(mode==='product'&&pv) pv.zoom=clamp(pv.zoom,.5,1.2); },{passive:true});
const _pot=productOrbitTarget;
productOrbitTarget=function(){ const t=_pot(); t.polar=Math.min(t.polar,80); t.W=Math.min(t.W,(P[pv.id].views[pv.view][1].W)*1.2); return t; };

/* shadows only redraw when something that casts one moves; camera-only frames skip both shadow passes */
renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;
let shadowSig=NaN;
function sceneSig(){
  scene.updateMatrixWorld(); let h=0, i=0;
  scene.traverseVisible(o=>{ if(!o.isMesh||!o.castShadow) return; i++; const e=o.matrixWorld.elements;
    h+=(e[12]*1.1+e[13]*1.3+e[14]*1.7+e[0]*3.1+e[5]*5.3+e[10]*7.7+e[4]*2.3+e[9]*4.1)*(1+(i%97)*.013)+(o.material&&o.material.opacity!=null?o.material.opacity*11:0); });
  return h+i*1e-3+key.intensity*.37+key.position.x*1e-3;
}
const _renderContact=renderContact;
renderContact=function(){ const sig=sceneSig(); if(Math.abs(sig-shadowSig)>1e-4||shadowSig!==shadowSig){ shadowSig=sig; renderer.shadowMap.needsUpdate=true; _renderContact(); } };
addEventListener('resize',()=>{ shadowSig=NaN; });

/* adaptive resolution: if frames get slow, draw fewer pixels; give them back when it's smooth */
const dprMax=()=>Math.min(devicePixelRatio||1, mobile()?1.5:(innerWidth>1900?1.25:1.5));
let dprNow=dprMax(), slow=0, fast=0, lastT=0;
const _resize=resize;
resize=function(){ _resize(); dprNow=Math.min(dprNow,dprMax()); renderer.setPixelRatio(dprNow); renderer.setSize(size.w,size.h,false); };
(function perf(t){
  if(awake>0&&lastT){ const dt=t-lastT;
    if(dt>28){ slow++; fast=0; } else if(dt<17){ fast++; slow=Math.max(0,slow-1); }
    if(slow>20&&dprNow>.75){ dprNow=Math.max(.75,+(dprNow-.25).toFixed(2)); slow=0; renderer.setPixelRatio(dprNow); renderer.setSize(size.w,size.h,false); kick(); }
    if(fast>240&&dprNow<dprMax()){ dprNow=Math.min(dprMax(),+(dprNow+.25).toFixed(2)); fast=0; renderer.setPixelRatio(dprNow); renderer.setSize(size.w,size.h,false); kick(); }
  }
  lastT=t; requestAnimationFrame(perf);
})(0);
resize();

/* ---------- 2. readable without blur: captions as game subtitles ---------- */
const css3=`
.frost::before{display:none!important}
html{--bandH:84px}
@media (max-width:760px){ html{--bandH:112px} }
/* subtitles: one fixed spot, bottom centre; no box, no band, no blur; the letters carry their own shadow */
#subs{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--bandH) + 12px);width:min(980px,calc(100vw - 32px));z-index:9;
  display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;pointer-events:none;color:#fff;
  text-shadow:0 0 2px rgba(0,0,0,.95),0 1px 3px rgba(0,0,0,.85),0 2px 14px rgba(0,0,0,.5)}
#subs .cap{position:static!important;left:auto!important;top:auto!important;bottom:auto!important;width:auto!important;max-width:none!important;
  background:none!important;color:#fff!important;padding:0!important;border:0!important;box-shadow:none!important;text-shadow:inherit!important;
  display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:baseline;column-gap:22px;row-gap:2px;pointer-events:auto}
#subs .cap .eyebrow,#subs .cap h1,#subs .cap h2,#subs .cap .body{flex-basis:100%}
#subs .cap .steps{display:none!important}
#subs .cap .eyebrow{margin:0;color:#F2F1EE!important;font-size:13px;letter-spacing:.09em;opacity:.92}
#subs .cap h1,#subs .cap h2{margin:0;font:600 34px/1.18 var(--display);letter-spacing:0;color:#fff}
#subs .cap h1{font-size:40px}
#subs .cap .stop{display:none!important}
#subs .cap .body{margin:2px 0 0;font:500 19px/1.45 var(--display);color:#fff;max-width:62ch}
#subs .cap .more,#subs .cap .row .btn{background:none!important;border:0!important;border-radius:0!important;padding:4px 0!important;min-height:0!important;
  color:#fff!important;font:600 15px var(--display)!important;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1.5px;cursor:pointer;box-shadow:none!important;text-shadow:inherit!important}
#subs .cap .more{order:5}
#subs .cap .row{order:4;margin:0;display:flex;gap:18px;justify-content:center}
.eve #subs .cap .row .btn{color:var(--lamp)!important}
#subs .side{display:flex;align-items:center;justify-content:center;gap:18px;pointer-events:auto;margin-top:0;opacity:.92}
#guide{position:static!important;transform:none!important;max-width:none!important;color:#fff!important;font:600 14px var(--display)!important;gap:8px!important;opacity:.95}
#guide svg{width:18px;height:18px;filter:drop-shadow(0 0 2px rgba(0,0,0,.9))}
#guide .gbtn{display:none}
#play{display:inline-flex;align-items:center;gap:7px;background:none;border:0;color:#fff;font:600 14px var(--display);padding:4px 0;cursor:pointer;white-space:nowrap;text-decoration:underline;text-underline-offset:4px;text-shadow:inherit}
#play svg{width:11px;height:11px;filter:drop-shadow(0 0 2px rgba(0,0,0,.9))}
#play:hover{text-decoration-thickness:2.5px}
/* small solid chips on top of the scene, no blur */
.chips .clock,.proto-tag{background:var(--graphite)!important;color:var(--studio-white)!important;padding:7px 12px!important}
.proto-tag{display:inline-flex;gap:6px;align-items:center;text-transform:none!important;letter-spacing:.01em!important;font:600 12.5px var(--display)!important}
.chips .left{display:flex;gap:6px;pointer-events:auto}
.chips .left button{border:0;background:var(--graphite);color:var(--studio-white);font:600 12.5px var(--display);padding:7px 12px;cursor:pointer}
.chips .left button:hover{text-decoration:underline;text-underline-offset:3px}
#rail{bottom:calc(var(--bandH) + 24px)!important}
#rail .end{background:var(--graphite);color:var(--studio-white)!important;padding:2px 6px}
.eve #rail .end{background:var(--studio-white);color:var(--graphite)!important}
@media (max-width:760px){
  #subs{bottom:calc(var(--bandH) + 12px);gap:6px}
  #subs .cap h1{font-size:24px}#subs .cap h2{font-size:21px}
  #subs .cap .eyebrow{font-size:11.5px}
  #subs .cap .body{font-size:16px}
  #guide,#play{font-size:13px!important}
  .chips .left button,.proto-tag{font-size:11.5px!important;padding:6px 9px!important}
  .chips .clock{display:none}
}
/* ---------- intro ---------- */
#intro{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:20px;background:rgba(30,31,33,.62)}
#intro[hidden]{display:none}
#intro .card{position:relative;width:min(560px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--studio);color:var(--graphite);padding:34px 36px 30px}
#intro .card::after{content:"";position:absolute;right:0;top:0;width:34px;height:34px;background:var(--felt);clip-path:polygon(0 0,100% 0,100% 100%)}
#intro .wm{height:22px;width:auto;display:block;margin-bottom:22px}
#intro h2{font:600 34px/1.05 var(--display);margin:0 0 10px;letter-spacing:-.01em}
#intro .lead{font-size:18px;margin:0 0 18px}
#intro ol{list-style:none;margin:0 0 22px;padding:0;border-top:1.5px solid var(--graphite)}
#intro li{display:grid;grid-template-columns:34px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #CFCDC8;font-size:16px;line-height:1.45}
#intro li b{font-family:var(--display);font-weight:600}
#intro li svg{width:26px;height:26px;margin-top:2px}
#intro .acts{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}
#intro .acts .btn{border-radius:0;min-height:48px;padding:0 20px}
#intro .acts .ghost{background:none;color:var(--graphite)}
#intro .by{margin:20px 0 0;font-size:14px;color:var(--muted)}
#intro .by b{color:var(--graphite)}
@media (max-width:760px){ #intro .card{padding:26px 22px 22px} #intro h2{font-size:27px} #intro li{font-size:15px} }

.pg a{color:var(--graphite);text-underline-offset:3px}
.pg a.btn{color:#fff}
`;
const st3=document.createElement('style'); st3.textContent=css3; document.head.appendChild(st3);

const subs=document.createElement('div'); subs.id='subs';
subs.appendChild(capEl);
const side=document.createElement('div'); side.className='side';
side.appendChild(guide);
const play=document.createElement('button'); play.id='play'; play.type='button';
side.appendChild(play); subs.appendChild(side); uiEl.appendChild(subs);
capEl.classList.remove('frost'); guide.classList.remove('frost');
// lift the scene a little on desktop so the products sit above the subtitle zone
let shift=0;
const _scs=storyCamState; storyCamState=function(out){ _scs(out); out.sy+=shift; return out; };
const _pts=plateToScreen; plateToScreen=function(px,py){ const r=_pts(px,py); r[1]-=shift; return r; };
(function sh(){ const tgt=(mode==='story'&&!page&&!mobile())?Math.min(70,innerHeight*.07):0;
  if(Math.abs(shift-tgt)>.3){ shift+=(RM||SNAP)?(tgt-shift):(tgt-shift)*.12; kick(); } else shift=tgt; requestAnimationFrame(sh); })();

/* top-left: a permanent, quiet credit */
const tag=$('#protoTag');
const left=document.createElement('div'); left.className='left'; tag.parentNode.insertBefore(left,tag); left.appendChild(tag);
tag.innerHTML=mobile()?`Concept by ${esc(CFG.designer)}`:`A concept shop by ${esc(CFG.designer)}`;
tag.setAttribute('aria-label',`A concept shop designed by ${CFG.designer}. About this project`);
const how=document.createElement('button'); how.type='button'; how.textContent='How it works'; left.appendChild(how);
const ct=document.createElement('button'); ct.type='button'; ct.textContent='Contact'; left.appendChild(ct);
ct.addEventListener('click',()=>openPage('contact'));

/* guide copy: short, in the strip, never on the scene */
const MOVE=matchMedia('(hover:none)').matches?'Swipe up':'Scroll';
Object.assign(GUIDE,{
  start:[GUIDE.start[0],`${MOVE} to set out the desk`],
  setting:[GUIDE.setting[0],`${MOVE} on, or stop any time`],
  explore:['tap',`${matchMedia('(hover:none)').matches?'Tap':'Click'} a label to see it up close`],
  closing:[GUIDE.closing[0],`${MOVE} on to finish the day`],
  end:['done','That’s the day']
});
gKey='';
// in the strip the guide doesn't need to step back while moving
const _syncGuide=syncGuide;
syncGuide=function(){ gIdle=999; _syncGuide(); };

/* ---------- 3. play the day ---------- */
const HOLD={0:2200,1:2600,2:2600,3:2600,4:4200,5:2600,6:3000};
let playing=false, plan=[], seg=0, segT0=0;
const pNow=()=>{ const tr=$('#track'), max=tr.offsetHeight-innerHeight; return clamp((scrollY-tr.offsetTop)/max,0,1); };
const pGo=p=>{ const tr=$('#track'), max=tr.offsetHeight-innerHeight; scrollTo(0,tr.offsetTop+p*max); };
function buildPlan(from){
  const stops=STEPS.map((s,k)=>({p:k?Math.min(.999,s.at+.012):0,k})).concat([{p:1,k:6}]);
  const out=[]; let cur=from;
  for(const s of stops){ if(s.p<=from+.004) continue; out.push({a:cur,b:s.p,dur:RM?0:Math.max(900,(s.p-cur)*16000)}); out.push({hold:HOLD[s.k]||2600}); cur=s.p; }
  return out;
}
function setPlay(){ play.classList.toggle('on',playing);
  const atEnd=pNow()>.995;
  play.innerHTML=playing?'<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="1" width="3.5" height="10" fill="currentColor"/><rect x="7.5" y="1" width="3.5" height="10" fill="currentColor"/></svg>Pause':
    `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor"/></svg>${atEnd?'Play again':'Play the day'}`;
  play.setAttribute('aria-pressed',playing); }
function startPlay(){ let from=pNow(); if(from>.995){ pGo(0); from=0; } plan=buildPlan(from); seg=0; segT0=performance.now(); playing=true; setPlay(); }
function stopPlay(){ if(!playing) return; playing=false; setPlay(); }
play.addEventListener('click',()=>playing?stopPlay():startPlay());
(function tick(t){
  if(playing){
    if(mode!=='story'||page){ stopPlay(); }
    else { const s=plan[seg];
      if(!s){ stopPlay(); }
      else { const e=t-segT0;
        if(s.hold!=null){ if(e>=s.hold){ seg++; segT0=t; } }
        else { const k=s.dur?clamp(e/s.dur,0,1):1; pGo(lerp(s.a,s.b,ease(k))); if(k>=1){ seg++; segT0=t; } } } }
  }
  requestAnimationFrame(tick);
})(0);
// any input of your own takes over
const takeOver=()=>stopPlay();
addEventListener('wheel',takeOver,{passive:true}); addEventListener('touchstart',takeOver,{passive:true});
addEventListener('keydown',e=>{ if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)&&e.target===document.body) takeOver(); });
canvas.addEventListener('pointerdown',takeOver);
$('#pins').addEventListener('click',takeOver,true); rail.addEventListener('click',takeOver,true);
addEventListener('scroll',()=>{ if(!playing) setPlay(); },{passive:true});
setPlay();

/* ---------- 4. the intro ---------- */
const intro=document.createElement('div'); intro.id='intro'; intro.hidden=true;
intro.setAttribute('role','dialog'); intro.setAttribute('aria-modal','true'); intro.setAttribute('aria-labelledby','introH');
const I=(d)=>`<svg viewBox="0 0 26 26" aria-hidden="true">${d}</svg>`;
intro.innerHTML=`<div class="card">
  <img class="wm" src="assets/brand/wordmark-line.svg" alt="Fold Supply" width="605" height="106">
  <h2 id="introH">A shop on a desk<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
  <p class="lead">Three things for the desk you work at and then live at. This whole room is the shop.</p>
  <ol>
    <li>${I('<rect x="8" y="2" width="10" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="12" y="5" width="2" height="5" fill="currentColor"/><path d="M9 23l4 2 4-2" fill="none" stroke="currentColor" stroke-width="1.6"/>')}<span><b>${MOVE} through a working day.</b> At nine the desk sets itself out. At six it folds away. Stop anywhere.</span></li>
    <li>${I('<circle cx="13" cy="13" r="4" fill="currentColor"/><circle cx="13" cy="13" r="10" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".5"/>')}<span><b>${matchMedia('(hover:none)').matches?'Tap':'Click'} anything with a label.</b> Turn it, fold it, roll it, see its sizes, and add it to your bag.</span></li>
    <li>${I('<rect x="3" y="6" width="20" height="15" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 6l4-4h12l4 4" fill="none" stroke="currentColor" stroke-width="1.8"/>')}<span><b>The room holds the rest.</b> The notebook is help, the framed print is our approach, the window is delivery. Your bag is a box on the desk.</span></li>
  </ol>
  <div class="acts"><button class="btn add" type="button" data-intro="play">Play the day for me</button><button class="btn ghost" type="button" data-intro="self">I’ll explore myself</button></div>
  <p class="by">A concept shop designed and built by <b>${esc(CFG.designer)}</b>. Fold Supply is fictional: nothing is for sale. <button class="link" type="button" data-intro="about" style="font-size:14px">About this project</button></p>
</div>`;
document.body.appendChild(intro);
let introFocus=null;
function showIntro(){ introFocus=document.activeElement; intro.hidden=false; document.documentElement.classList.add('locked'); setTimeout(()=>intro.querySelector('[data-intro="play"]').focus(),RM?0:60); }
function hideIntro(){ intro.hidden=true; document.documentElement.classList.remove('locked'); try{ localStorage.setItem('fold-intro','1'); }catch(e){} }
intro.addEventListener('click',e=>{ const b=e.target.closest('[data-intro]'); if(!b) return; const a=b.dataset.intro; hideIntro();
  if(a==='play'){ pGo(0); setTimeout(startPlay,RM?0:350); } else if(a==='about'){ openPage('about'); } else { setTimeout(()=>tag.focus(),50); } });
intro.addEventListener('keydown',e=>{ if(e.key==='Escape'){ hideIntro(); } if(e.key==='Tab'){ const f=[...intro.querySelectorAll('button')]; const i=f.indexOf(document.activeElement); if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); } } });
how.addEventListener('click',()=>{ stopPlay(); showIntro(); });
{ let seen=false; try{ seen=localStorage.getItem('fold-intro')==='1'; }catch(e){}
  const q=new URLSearchParams(location.search);
  const want=q.has('intro')||(!seen&&!q.has('snap')&&!location.hash);
  if(want){ const go=()=>setTimeout(showIntro,RM?0:500); if($('#loader')&&!$('#loader').classList.contains('done')){ const mo=new MutationObserver(()=>{ if($('#loader').classList.contains('done')){ mo.disconnect(); go(); } }); mo.observe($('#loader'),{attributes:true}); } else go(); } }

/* ---------- 5. About (full disclaimers) and Contact ---------- */
PAGES.contact={px:[1536,1080],zoom:1.0,label:'Contact'};
const _render2=render;
render=function(){
  if(page==='about') return `<p class="eyebrow">Fictional brand</p><h2 id="pvName" tabindex="-1">About this project<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
  <p class="lead">Fold Supply is not a real company. It’s a self-initiated concept shop by ${esc(CFG.designer)}, made for her portfolio.</p>
  <h3>Whose work this is</h3><p>The concept, brand identity, shop experience, interface and interaction design, writing and art direction are ${esc(CFG.designer)}’s original work. © ${new Date().getFullYear()} ${esc(CFG.designer)}. All rights reserved. Please don’t reuse this work or present it as your own without written permission.</p>
  <h3>Nothing is for sale</h3><p>The products, prices, stock, delivery and returns are part of a design brief, not real offers. No payment is taken, no order is placed and nothing is sent. The checkout is a prototype.</p>
  <h3>The products</h3><p>The mat, stand and clips don’t exist as manufactured goods. Their sizes and materials are design specifications, modelled in 3D to those sizes. The laptop, cable and everything else in the room are there for scale only.</p>
  <h3>Images</h3><p>The room image and the product photos are AI-generated concept images, art-directed by ${esc(CFG.designer)}. They don’t show real, tested products.</p>
  <h3>How it’s built</h3><p>Live three.js products sit in a still image of a room. The camera was solved from the desk’s four corners, so the products line up with the image and cast shadows onto it. The code was written with Claude (Anthropic) as a development partner, from ${esc(CFG.designer)}’s designs and direction.</p>
  <h3>Credits</h3>
  <dl><dt>Lighting</dt><dd><a href="https://polyhaven.com/a/hotel_room" target="_blank" rel="noopener">Hotel Room</a> HDRI by Greg Zaal, Poly Haven (CC0)</dd>
  <dt>Material textures</dt><dd><a href="https://polyhaven.com/a/caban" target="_blank" rel="noopener">Caban</a>, Poly Haven (CC0) · <a href="https://ambientcg.com/view?id=MetalSubstance005" target="_blank" rel="noopener">Metal Substance 005</a>, ambientCG (CC0)</dd>
  <dt>Type</dt><dd>Chillax (Indian Type Foundry) and Gentium Book Plus (SIL)</dd>
  <dt>3D</dt><dd>three.js (MIT)</dd></dl>
  <p class="note" style="margin-top:10px">Third-party assets stay under their own licences.</p>
  <h3>Privacy</h3><p>No cookies, no analytics, no accounts. Your browser keeps one setting so the intro doesn’t show twice. Anything you type at checkout stays on your screen. Fonts load from Google Fonts and the 3D library from jsDelivr, which, like any website, can see your IP address.</p>
  <h3>Contact</h3><p><a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a> · <a href="${esc(CFG.website)}" target="_blank" rel="noopener">${esc(siteLabel)}</a></p>
  <h3>Reduced motion</h3><p>If your device asks for less motion, the camera cuts between views and pages open without animation.</p>`;
  if(page==='contact') return `<p class="eyebrow">Contact</p><h2 id="pvName" tabindex="-1">Say hello<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
  <p class="lead">Fold Supply is a concept by ${esc(CFG.designer)}, a UI/UX and brand designer. For freelance work, or questions about this project, get in touch.</p>
  <dl><dt>Email</dt><dd><a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a></dd>
  <dt>Website</dt><dd><a href="${esc(CFG.website)}" target="_blank" rel="noopener">${esc(siteLabel)}</a></dd></dl>
  <p style="margin-top:18px"><a class="btn add" href="mailto:${esc(CFG.email)}?subject=${encodeURIComponent('Hello from Fold Supply')}" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;width:100%">Email ${esc(CFG.designer.split(' ')[0])}</a></p>
  <p class="note" style="margin-top:14px">This shop is fictional. Please don’t send orders or payment details.</p>`;
  return _render2();
};
}
