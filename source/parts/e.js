
/* =========================================================
   R11: readable over the scene, labels that don't collide,
   a guide that says what you can do, About as its own page.
   (inserted inside d.js's scope by build2.py)
   ========================================================= */
{
const css2=`
/* --- frost: a soft, feathered blur behind text that sits on the scene --- */
.frost{isolation:isolate}
.chips .clock,.proto-tag{position:relative}
.frost::before{content:"";position:absolute;inset:-26px -48px -28px -40px;z-index:-1;pointer-events:none;
  background:rgba(242,241,238,.3);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 48px),transparent),linear-gradient(180deg,transparent,#000 26px,#000 calc(100% - 28px),transparent);
  -webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 48px),transparent),linear-gradient(180deg,transparent,#000 26px,#000 calc(100% - 28px),transparent);mask-composite:intersect}
.eve .frost::before{background:rgba(24,24,26,.4)}
.cap{text-shadow:none!important;padding:16px 4px 4px 0!important}
.cap .eyebrow{color:#45474B}
.eve .cap .eyebrow{color:#D4D5D7}
.cap .more{color:inherit}
.cap .steps{display:none}
@media (min-width:761px){ .cap{width:max-content;max-width:520px} }
/* clock and tag: same frost, no slabs */
.chips .clock{background:none!important;color:var(--graphite);padding:6px 4px}
.eve .chips .clock{color:var(--studio-white)}
.proto-tag{border:0;background:none!important;cursor:pointer;color:#45474B;padding:6px 4px;font:600 11px var(--display);letter-spacing:.09em;text-transform:uppercase}
.proto-tag u{text-underline-offset:3px;text-decoration-thickness:1.5px}
.proto-tag:hover u{text-decoration-thickness:2.5px}
.eve .proto-tag{color:#D4D5D7}
/* --- labels: products are priced chips, room objects are quieter --- */
.pin span{transition:background .15s,color .15s}
.pin.room span{background:rgba(30,31,33,.78)!important;color:var(--studio-white);font-size:13px;padding:6px 10px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.pin.room:hover span,.pin.room:focus-visible span{background:var(--graphite)!important}
.pin.room i{background:rgba(236,235,232,.85)}
.pin.room em{background:var(--graphite);box-shadow:0 0 0 3px rgba(236,235,232,.85);animation:none}
.pin.pl-down{flex-direction:column-reverse;transform:translate(-50%,-5px)}
.pin.pl-down em{margin:0 0 -5px}
.pin.pl-left{flex-direction:row;transform:translate(calc(-100% + 5px),-50%)}
.pin.pl-right{flex-direction:row-reverse;transform:translate(-5px,-50%)}
.pin.pl-left i,.pin.pl-right i{width:18px;height:1.5px}
.pin.pl-left em{margin:0 0 0 -5px}.pin.pl-right em{margin:0 -5px 0 0}
/* --- the day rail: where you are, where it ends --- */
#rail{position:fixed;right:22px;top:76px;bottom:110px;width:120px;z-index:6;pointer-events:none}
#rail .line{position:absolute;right:5px;top:24px;bottom:24px;width:1.5px;background:rgba(30,31,33,.4)}
#rail .fill{position:absolute;right:4.5px;top:24px;width:2.5px;background:var(--graphite)}
.eve #rail .line{background:rgba(236,235,232,.3)}.eve #rail .fill{background:var(--lamp)}
#rail .end{position:absolute;right:0;font:700 12px var(--body);color:var(--graphite);white-space:nowrap;font-variant-numeric:lining-nums tabular-nums}
#rail .end.t{top:0}#rail .end.b{bottom:0}
#rail{filter:drop-shadow(0 0 6px rgba(242,241,238,.9))}.eve #rail{filter:drop-shadow(0 0 6px rgba(24,24,26,.9))}
.eve #rail .end{color:var(--studio-white)}
#rail button{position:absolute;right:0;width:12px;height:12px;margin-top:-6px;padding:0;border:0;background:none;cursor:pointer;pointer-events:auto}
#rail button::after{content:"";position:absolute;right:2px;top:3px;width:7px;height:7px;background:#F2F1EE;box-shadow:0 0 0 1.5px var(--graphite)}
#rail button.done::after{background:var(--graphite)}
#rail button[aria-current="step"]::after{width:11px;height:11px;right:0;top:1px;background:var(--graphite);clip-path:polygon(0 0,100% 0,100% 100%,0 100%);box-shadow:none}
.eve #rail button::after{background:#2A2B2E;box-shadow:0 0 0 1.5px var(--studio-white)}
.eve #rail button.done::after,.eve #rail button[aria-current="step"]::after{background:var(--lamp)}
#rail button b{position:absolute;right:20px;top:-4px;font:600 12px var(--display);color:var(--graphite);white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none}
#rail button[aria-current="step"] b,#rail button:hover b,#rail button:focus-visible b{opacity:1}
.eve #rail button b{color:var(--studio-white)}
/* --- the guide: one line that says what you can do now --- */
#guide{position:fixed;left:50%;bottom:104px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);
  font:600 15px var(--display);color:var(--graphite);transition:opacity .35s;pointer-events:none}
#guide.off{opacity:0}
.eve #guide{color:var(--studio-white)}
#guide svg{flex:none;width:22px;height:22px}
#guide .gbtn{pointer-events:auto;font:600 14px var(--display);background:none;border:0;border-bottom:2px solid currentColor;color:inherit;padding:4px 0;cursor:pointer;margin-left:4px;white-space:nowrap}
#guide .wheel{animation:wheel 1.6s ease-in-out infinite}
@keyframes wheel{0%{transform:translateY(0);opacity:1}70%{transform:translateY(5px);opacity:0}100%{transform:translateY(0);opacity:0}}
#guide .swipe{animation:swipe 1.8s ease-in-out infinite}
@keyframes swipe{0%{transform:translateY(5px);opacity:0}30%{opacity:1}100%{transform:translateY(-6px);opacity:0}}
.pv-hint{background:none!important;color:var(--graphite)!important;padding:8px 4px!important}
.pv-hint.frost::before{inset:-8px -22px}
#rail.frost::before{inset:-14px -14px -14px 70px}
@media (max-width:760px){
  #rail{display:none}
  .cap .steps{display:flex}
  .cap{padding:12px 16px 14px!important}
  .cap.frost::before{display:none}
  #guide{bottom:auto;top:52px;font-size:13px;gap:8px;width:max-content}
  #guide svg{width:18px;height:18px}
  .pv-hint{top:58px!important}
}
@media (prefers-reduced-motion:reduce){ #guide .wheel,#guide .swipe{animation:none} }
`;
const st2=document.createElement('style'); st2.textContent=css2; document.head.appendChild(st2);
const touch=matchMedia('(hover:none)').matches;

/* frost the text that sits on the scene */
capEl.classList.add('frost'); $('.chips .clock').classList.add('frost'); $('#protoTag').classList.add('frost');
$('#pvHint').classList.add('frost');
if(touch) $('#pvHint').firstChild.textContent='Drag to turn · ';

/* ---- About this project: a page like the others ---- */
PAGES.about={px:[1536,1080],zoom:1.0,label:'About this project'};
const _render=render;
render=function(){
  if(page!=='about') return _render();
  return `<p class="eyebrow">Fictional brand</p><h2 id="pvName" tabindex="-1">About this project<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
  <p class="lead">Fold Supply is a self-initiated brand and shop by Yas Dastan. Nothing is for sale, no payment is taken and nothing is sent.</p>
  <h3>The idea</h3><p>The desk is the shop. Scrolling is a working day, from 08:55 to 18:00. Each object in the room holds a page: the notebook is help, the framed print is our approach, the window is delivery and the kraft box is the bag.</p>
  <h3>Built to the brief</h3><p>The mat is 700 × 350 × 3 mm with 12 mm corners. The stand opens to a 110 mm rear height and folds to 22 mm. Each clip is 44 × 20 × 12 mm with three channels. The 3D products are modelled to these sizes.</p>
  <h3>How it’s made</h3><p>Live three.js products sit in a still image of a room. The camera was solved from the desk’s four corners, so the products line up with the image and cast shadows onto it.</p>
  <h3>Not included</h3><p>The laptop, the cable and everything else in the room are there for scale only.</p>
  <h3>Images and credits</h3>
  <dl><dt>Room and product photos</dt><dd>AI-generated concept images</dd>
  <dt>Lighting</dt><dd><a href="https://polyhaven.com/a/hotel_room" target="_blank" rel="noopener">Hotel Room</a> HDRI by Greg Zaal, Poly Haven (CC0)</dd>
  <dt>Material textures</dt><dd><a href="https://polyhaven.com/a/caban" target="_blank" rel="noopener">Caban</a>, Poly Haven (CC0) · <a href="https://ambientcg.com/view?id=MetalSubstance005" target="_blank" rel="noopener">Metal Substance 005</a>, ambientCG (CC0)</dd>
  <dt>Type</dt><dd>Chillax (Indian Type Foundry) and Gentium Book Plus (SIL)</dd>
  <dt>3D</dt><dd>three.js</dd></dl>
  <h3>Reduced motion</h3><p>If your device asks for less motion, the camera cuts between views and pages open without animation.</p>`;
};
$('#protoTag').addEventListener('click',()=>openPage('about'));

/* ---- the day rail (desktop): start, end, where you are; every stop is a jump ---- */
const rail=document.createElement('nav'); rail.id='rail'; rail.setAttribute('aria-label','The day, step by step');
rail.innerHTML=`<span class="end t" aria-hidden="true">08:55</span><div class="line"></div><div class="fill"></div><span class="end b" aria-hidden="true">18:00 · end</span>`+
  STEPS.map((s,k)=>`<button type="button" data-k="${k}" aria-label="Go to ${STEP_NAMES[k]}"><b>${STEP_NAMES[k]}</b></button>`).join('');
rail.classList.add('frost'); uiEl.appendChild(rail);
rail.addEventListener('click',e=>{ const b=e.target.closest('[data-k]'); if(b){ const k=+b.dataset.k; goToP(STEPS[k].at+(k?.012:0)); } });
function layoutRail(){
  const H=rail.clientHeight-48;
  rail.querySelectorAll('button').forEach(b=>{ const k=+b.dataset.k; b.style.top=(24+STEPS[k].at/.96*H).toFixed(1)+'px'; b.classList.toggle('done',k<stepIdx); if(k===stepIdx) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
  rail.querySelector('.fill').style.height=(clamp(pCur/.96,0,1)*H).toFixed(1)+'px';
}

/* ---- the guide: what you can do right now ---- */
const guide=document.createElement('div'); guide.id='guide'; guide.className='frost'; guide.setAttribute('role','status');
uiEl.appendChild(guide);
const ICON={
  scroll:'<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="6" y="2" width="10" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect class="wheel" x="10.2" y="5" width="1.6" height="4" rx=".8" fill="currentColor"/></svg>',
  swipe:'<svg viewBox="0 0 22 22" aria-hidden="true"><g class="swipe"><path d="M11 18V5M7 9l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></g></svg>',
  tap:'<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="3" fill="currentColor"/><circle cx="11" cy="11" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/></svg>',
  done:'<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M3 3h16L3 19z" fill="#C9CACC"/><path d="M3 19h16V3z" fill="currentColor"/></svg>'
};
const MOVE=touch?'Swipe up':'Scroll';
const GUIDE={
  start:[touch?'swipe':'scroll',`This desk is the shop. ${MOVE} to set it out.`],
  setting:[touch?'swipe':'scroll',`Keep going. The desk sets itself out.`],
  explore:['tap',`${touch?'Tap':'Click'} anything with a label to look closer. Or keep going to six.`],
  closing:[touch?'swipe':'scroll',`Keep going to finish the day.`],
  end:['done',`That’s the day. Open anything, or`]
};
let gKey='', gIdle=0, lastP=-1;
function guideState(){
  if(mode!=='story'||page||trans>0) return '';
  const p=pCur;
  if(p<.03) return 'start';
  if(p>=.905) return 'end';
  if(EXPLORE(p)) return 'explore';
  return p<.515?'setting':'closing';
}
function syncGuide(){
  const k=guideState();
  // while the desk is moving, the guide steps back; it returns when you pause
  const moving=Math.abs(pCur-lastP)>.0004; lastP=pCur;
  gIdle=moving?0:gIdle+1;
  const quiet=(k==='setting'||k==='closing')&&gIdle<40;
  guide.classList.toggle('off',!k||quiet);
  if(k===gKey) return; gKey=k; if(!k) return;
  const [ic,txt]=GUIDE[k];
  guide.innerHTML=ICON[ic]+`<span>${txt}</span>`+(k==='end'?`<button class="gbtn" type="button" data-again>start the morning again ↑</button>`:'');
}
guide.addEventListener('click',e=>{ if(e.target.closest('[data-again]')) goToP(0); });

/* ---- labels: no overlaps, nothing over the caption, clock or rail ---- */
const PREF={mat:['up','down','right','left'],stand:['up','right','left','down'],clips:['up','down','left','right'],
  help:['up','right','down'],approach:['right','left','down'],delivery:['left','up','down'],lamp:['right','up','down'],box:['up','left','right']};
const placed={};
const shown=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
const rectOf=el=>{ const r=el.getBoundingClientRect(); return {x0:r.left,y0:r.top,x1:r.right,y1:r.bottom}; };
const hit=(a,b,m=6)=>a.x0<b.x1+m&&a.x1>b.x0-m&&a.y0<b.y1+m&&a.y1>b.y0-m;
function labelRect(pl,x,y,w,h){
  if(pl==='up') return {x0:x-w/2,y0:y-22-h,x1:x+w/2,y1:y-22};
  if(pl==='down') return {x0:x-w/2,y0:y+17,x1:x+w/2,y1:y+17+h};
  if(pl==='left') return {x0:x-18-w,y0:y-h/2,x1:x-18,y1:y+h/2};
  return {x0:x+18,y0:y-h/2,x1:x+18+w,y1:y+h/2};
}
function layoutPins(){
  const bandH=$('#band').offsetHeight;
  const obstacles=[];
  for(const el of [capEl,$('.chips .clock'),$('#protoTag'),guide]){ if(shown(el)&&!el.classList.contains('off')){ const r=rectOf(el); if(r.x1>r.x0) obstacles.push(r); } }
  if(shown(rail)) obstacles.push({x0:size.w-150,y0:70,x1:size.w,y1:size.h-bandH});
  const list=[];
  for(const id of ['mat','stand','clips']) list.push([id,pins[id]]);
  for(const k in roomPins) list.push([k,roomPins[k]]);
  list.push(['box',boxPin]);
  pins.laptop.classList.add('hide'); pins.laptop.tabIndex=-1; pins.laptop.setAttribute('aria-hidden','true');
  const dots=list.filter(([,b])=>!b.classList.contains('hide')).map(([,b])=>{ const x=parseFloat(b.style.left), y=parseFloat(b.style.top); return {x0:x-7,y0:y-7,x1:x+7,y1:y+7}; });
  const done=[];
  for(const [id,b] of list){
    if(b.classList.contains('hide')) continue;
    const x=parseFloat(b.style.left), y=parseFloat(b.style.top), sp=b.firstElementChild;
    sp.style.transform='';
    if(b.classList.contains('room')&&obstacles.some(o=>x>o.x0-10&&x<o.x1+10&&y>o.y0-10&&y<o.y1+10)){ b.classList.add('hide'); b.tabIndex=-1; continue; }
    const w=sp.offsetWidth, h=sp.offsetHeight;
    const order=[...(PREF[id]||['up','down','right','left'])]; if(placed[id]) order.unshift(placed[id]);
    let best=null, bestScore=1e9;
    for(const pl of order){
      const r=labelRect(pl,x,y,w,h);
      let s=0;
      if(r.x0<8||r.x1>size.w-8||r.y0<8||r.y1>size.h-bandH-8) s+=1000;
      for(const o of obstacles) if(hit(r,o)) s+=400;
      for(const o of done) if(hit(r,o)) s+=300;
      for(const d of dots) if(hit(r,d,0)) s+=50;
      if(s<bestScore){ bestScore=s; best=[pl,r]; }
      if(s===0) break;
    }
    const [pl,r]=best; placed[id]=pl;
    b.classList.remove('pl-down','pl-left','pl-right'); if(pl!=='up') b.classList.add('pl-'+pl);
    // still off-screen sideways? slide the label, keep the dot
    let dx=0; if(r.x0<8) dx=8-r.x0; else if(r.x1>size.w-8) dx=size.w-8-r.x1;
    if(dx&&(pl==='up'||pl==='down')) sp.style.transform=`translateX(${dx.toFixed(1)}px)`;
    done.push({x0:r.x0+dx,y0:r.y0,x1:r.x1+dx,y1:r.y1});
  }
}

/* caption always on the left wall, clear of the products */
const _ov3=overlays;
overlays=function(){
  _ov3();
  if(!mobile()){ capEl.style.left='36px'; }
  syncGuide(); if(shown(rail)) layoutRail();
  layoutPins();
};
/* keep the guide honest while scrolling, even when the frame loop is asleep */
addEventListener('scroll',()=>{ if(mode==='story') kick(); },{passive:true});
setInterval(()=>{ if(mode==='story'&&!page){ const k=guideState(); if((k==='setting'||k==='closing')&&guide.classList.contains('off')) { gIdle+=10; syncGuide(); } } },500);
}
