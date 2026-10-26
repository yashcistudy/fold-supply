
/* =========================================================
   Laptop (context only, not included) and cable connector
   ========================================================= */
const LAP=new THREE.MeshStandardMaterial({color:0xc6c9ce,metalness:.8,roughness:.32,envMapIntensity:1.1});
const keysTex=(()=>{ const c=document.createElement('canvas'); c.width=1024; c.height=400; const g=c.getContext('2d');
  g.fillStyle='#16171a'; g.fillRect(0,0,1024,400); g.fillStyle='#2b2d31';
  const rows=[[14,1],[14,1],[13,1.08],[12,1.17],[11,1.27]]; let y=14;
  rows.forEach(([n,k],ri)=>{ const kw=(1024-28-(n-1)*8)/n; for(let i=0;i<n;i++){ const x=14+i*(kw+8); g.beginPath(); g.roundRect(x,y,kw,ri===0?44:62,8); g.fill(); } y+=ri===0?52:70; });
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; })();
const LAPDARK=new THREE.MeshStandardMaterial({map:keysTex,roughness:.6,envMapIntensity:.4});
const screenTex=(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=336; const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,512,336); gr.addColorStop(0,'#3f5161'); gr.addColorStop(.55,'#9d8e7f'); gr.addColorStop(1,'#e6c9a3'); g.fillStyle=gr; g.fillRect(0,0,512,336);
  g.fillStyle='rgba(255,255,255,.10)'; for(let i=0;i<5;i++){ g.beginPath(); g.ellipse(120+i*70,220-i*18,160,40,-.4,0,Math.PI*2); g.fill(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const SCREEN=new THREE.MeshStandardMaterial({color:0x050506,roughness:.12,metalness:0,emissive:0xffffff,emissiveMap:screenTex,emissiveIntensity:.5,envMapIntensity:.7});
const laptop=new THREE.Group(); const lapInner=new THREE.Group(); laptop.add(lapInner);
{ const base=mk(new RoundedBoxGeometry(304,13,212,3,4),LAP,'laptop'); base.position.y=6.5; lapInner.add(base);
  const deck=mk(new THREE.BoxGeometry(270,.6,104),LAPDARK,'laptop'); deck.position.set(0,13.1,-26); lapInner.add(deck);
  const pad=mk(new THREE.BoxGeometry(118,.5,74),new THREE.MeshStandardMaterial({color:0x9a9ea4,metalness:.6,roughness:.3}),'laptop'); pad.position.set(0,13.05,58); lapInner.add(pad); }
const lidPivot=new THREE.Group(); lidPivot.position.set(0,13,-106); lapInner.add(lidPivot);
{ const lid=mk(new RoundedBoxGeometry(304,5,212,3,2),LAP,'laptop'); lid.position.set(0,2.5,106); lidPivot.add(lid);
  const scr=mk(new THREE.PlaneGeometry(284,184),SCREEN,'laptop'); scr.rotation.x=Math.PI/2; scr.position.set(0,-.2,104); lidPivot.add(scr); }
stand.add(laptop);
const lapMats=[LAP,LAPDARK,SCREEN];
const connector=mk(new THREE.CylinderGeometry(3.2,3.2,22,16),new THREE.MeshStandardMaterial({color:0x2a2b2e,roughness:.4,metalness:.3}),'clips');
connector.rotation.z=Math.PI/2; connector.position.set(52,5.4,126); clipsRoot.add(connector);
function placeLaptop(t,lid){ // t: 0 gone .. 1 resting on the stand
  laptop.visible=t>0.001;
  const r=rails[1].plate;
  laptop.position.copy(r.position); laptop.position.x=0;
  laptop.quaternion.copy(r.quaternion);
  lapInner.position.set(0,4+ (1-t)*90,-8+ (1-t)*0);
  lapInner.rotation.set(0,Math.PI,0);
  lidPivot.rotation.x=-lid*112*D2R;
  for(const m of lapMats){ m.transparent=t<.999; m.opacity=sstep(0,.6,t); }
}

/* =========================================================
   Story timeline (scroll progress 0..1)
   ========================================================= */
// camera crops of the photographed frame: [p, anchor, zoom]
const K=[[0,'full',1],[.05,'full',1],[.12,'mat',1.25],[.19,'mat',1.25],[.25,'stand',1.6],[.37,'stand',1.6],[.42,'clips',1.9],[.47,'clips',1.9],[.53,'full',1.04],[.70,'full',1.04],[.75,'stand',1.4],[.84,'stand',1.4],[.89,'full',1],[1,'full',1]];
const ANCH={full:new THREE.Vector3(0,40,-20),mat:new THREE.Vector3(0,0,0),stand:new THREE.Vector3(164,90,0),clips:new THREE.Vector3(-248,10,107)};
const calCam=new THREE.PerspectiveCamera(CAL.fov,CAL.W/CAL.H,8,30000);
calCam.position.fromArray(CAL.pos); calCam.quaternion.fromArray(CAL.quat); calCam.updateMatrixWorld(); calCam.updateProjectionMatrix();
const ANCH_PX={};
for(const k in ANCH){ const v=ANCH[k].clone().project(calCam); ANCH_PX[k]=[(v.x+1)/2*CAL.W,(1-v.y)/2*CAL.H]; }
function storyCrop(p){
  let i=0; while(i<K.length-2&&p>K[i+1][0]) i++;
  const a=K[i],b=K[i+1];
  const t=RM?(p-a[0]<(b[0]-a[0])/2?0:1):ease(ramp(p,a[0],b[0]));
  const ca=ANCH_PX[a[1]], cb=ANCH_PX[b[1]];
  return {cx:lerp(ca[0],cb[0],t),cy:lerp(ca[1],cb[1],t),zoom:Math.exp(lerp(Math.log(a[2]),Math.log(b[2]),t))};
}
function storyState(p){
  const s={};
  s.matIn=ease(ramp(p,.05,.08)); s.matU=1-ease(ramp(p,.08,.16));
  s.standIn=ease(ramp(p,.20,.23)); s.open=ease(ramp(p,.23,.31))*(1-ease(ramp(p,.80,.84)));
  s.lapIn=ease(ramp(p,.31,.34))*(1-ease(ramp(p,.78,.80))); s.lid=ease(ramp(p,.34,.37))*(1-ease(ramp(p,.76,.78)));
  s.clipsIn=ease(ramp(p,.38,.41)); s.cable=ramp(p,.39,.46);
  s.eve=ease(ramp(p,.82,.90));
  return s;
}
const EXPLORE=p=>(p>=.515&&p<=.70)||p>=.905;
const STEPS=[
  {at:0, eyebrow:'08:55 · Monday', h:'Work here. Fold it away at six', stop:true, big:true, body:'A felt mat, a folding laptop stand and two cable clips, set out at their real sizes on a real desk. Scroll to set them out.'},
  {at:.05, anchor:'mat', eyebrow:'1 of 3 · Desk Mat · £28', h:'Somewhere soft for your hands.', body:'700 × 350 × 3 mm of charcoal felt. It arrives rolled, the way it ships, and lies flat. It doesn’t fold.'},
  {at:.20, anchor:'stand', eyebrow:'2 of 3 · Folding Laptop Stand · £49', h:'Opens to 110 mm. Folds to 22.', body:'The legs cross and lift the back of your laptop 110 mm off the desk. The laptop is only there to show the height. It isn’t included.'},
  {at:.38, anchor:'clips', eyebrow:'3 of 3 · Cable Clips Pair · £9', h:'Three channels each.', body:'Two silicone clips, 44 × 20 × 12 mm. Each takes up to three cables 3 to 5 mm across, so the charger stays on the desk.'},
  {at:.48, eyebrow:'09:00 · Set out', h:'That’s the whole desk.', body:'Click anything on the desk to look closer. All three as the Desk Set: £76 instead of £86, with free delivery.', action:'set'},
  {at:.72, anchor:'stand', eyebrow:'17:59 · Clocking off', h:'Close the laptop. Fold the stand.', body:'The laptop goes away, and the stand folds flat to 22 mm right where it stood. The clips keep the cable on the desk for tomorrow.'},
  {at:.88, eyebrow:'18:00 · Evening', h:'Same desk. Different evening', stop:true, body:'Everything is still clickable. Open the folded stand, the mat or the clips to look closer.', action:'set'}
];
const STEP_NAMES=['Empty desk','Desk mat','Laptop stand','Cable clips','Set out','Clocking off','Evening'];

/* =========================================================
   UI: caption, pins, dims
   ========================================================= */
const capEl=$('#cap'), dimsEl=$('#dims'), pinsEl=$('#pins'), uiEl=$('#ui');
let stepIdx=-1, capOpen=false;
function setStep(i){
  if(i===stepIdx) return; stepIdx=i; capOpen=false;
  document.documentElement.classList.toggle('eve',i>=5);
  const s=STEPS[i];
  capEl.innerHTML=`<ol class="steps" aria-label="Story steps">${STEP_NAMES.map((n,k)=>`<li><button type="button" data-step="${k}" aria-label="Go to step ${k+1}: ${n}" ${k===i?'aria-current="step"':''} class="${k<i?'done':''}"></button></li>`).join('')}</ol>
    <p class="eyebrow">${s.eyebrow}</p>${(()=>{ const t=s.h+(s.stop?'<img class="stop day" src="assets/brand/fold-stop.svg" alt="."><img class="stop eve" src="assets/brand/fold-stop-evening.svg" alt=".">':''); return s.big?`<h1>${t}</h1>`:`<h2>${t}</h2>`; })()}
    <p class="body" id="capBody" hidden>${s.body}</p>
    <button class="more" type="button" aria-expanded="false" aria-controls="capBody">More</button>
    ${s.action?`<div class="row"><button class="btn" type="button" data-open="set">See the Desk Set · £76</button></div>`:''}`;
  if(!RM&&!SNAP){ capEl.classList.remove('in'); void capEl.offsetWidth; capEl.classList.add('in'); }
}
capEl.addEventListener('click',e=>{
  const s=e.target.closest('[data-step]'); if(s){ const k=+s.dataset.step; goToP(STEPS[k].at+(k?.012:0)); return; }
  const o=e.target.closest('[data-open]'); if(o){ openProduct(o.dataset.open); return; }
  const m=e.target.closest('.more'); if(m){ capOpen=!capOpen; $('#capBody').hidden=!capOpen; m.setAttribute('aria-expanded',capOpen); m.textContent=capOpen?'Less':'More'; kick(); }
});
function goToP(p){ const tr=$('#track'), max=tr.offsetHeight-innerHeight; scrollTo({top:tr.offsetTop+p*max,behavior:RM?'auto':'smooth'}); }
const PIN_IDS=['mat','stand','clips','laptop'];
const pins={};
for(const id of PIN_IDS){
  const b=document.createElement('button'); b.type='button'; b.className='pin hide'+(id==='laptop'?' info':'');
  const label=id==='laptop'?'Laptop · not included':`${P[id].name} · £${P[id].price}`;
  b.innerHTML=`<span>${label}</span><i></i><em></em>`;
  b.setAttribute('aria-label',id==='laptop'?'Laptop, not included. Shown for scale.':`Open ${P[id].name}, £${P[id].price}`);
  b.addEventListener('click',()=>{ if(id==='laptop') toast('The laptop isn’t included. It’s there to show the 110 mm height.'); else openProduct(id); });
  b.addEventListener('mouseenter',()=>{hover=id==='laptop'?null:id;kick();}); b.addEventListener('mouseleave',()=>{hover=null;kick();});
  b.addEventListener('focus',()=>{hover=id==='laptop'?null:id;kick();}); b.addEventListener('blur',()=>{hover=null;kick();});
  pinsEl.appendChild(b); pins[id]=b;
}
const proj=new THREE.Vector3();
function toScreen(x,y,z){ proj.set(x,y,z).project(camera); return [(proj.x+1)/2*size.w,(1-proj.y)/2*size.h,proj.z<1]; }
function anchorOf(id){
  if(id==='mat') return new THREE.Vector3(-110,4,-120);
  if(id==='stand') return new THREE.Vector3(stand.position.x+60,stand.position.y+(standKin?standKin.h*.55:14)+8,stand.position.z+40);
  if(id==='clips') return new THREE.Vector3(-248,16,CLIPZ);
  if(id==='laptop'){ const v=new THREE.Vector3(0,190,110); lidPivot.localToWorld(v.set(0,0,200)); return v; }
  return new THREE.Vector3();
}

/* =========================================================
   Camera: story crops of the photo, or an orbit in product view
   ========================================================= */
const size={w:innerWidth,h:innerHeight};
let mode='story', pv=null, trans=0, transTarget=0; // trans: 0 photo .. 1 product orbit
let pTarget=0, pCur=0, hover=null;
const ov={open:null,u:null,cables:1};
const applied={open:0,u:1,c2:0,c3:0};
const orbit={tx:0,ty:0,tz:0,W:600,polar:60,az:-30};
const camA={pos:new THREE.Vector3(),quat:new THREE.Quaternion(),fov:30,sx:0,sy:0};
const camB={pos:new THREE.Vector3(),quat:new THREE.Quaternion(),fov:32,sx:0,sy:0};
const tmpObj=new THREE.PerspectiveCamera(); // cameras look down -z, so lookAt suits a camera
function storyCamState(out){
  const w=size.w,h=size.h,as=w/h,PW=CAL.W,PH=CAL.H;
  const c=storyCrop(pCur);
  let wm,hm; if(as<=PW/PH){ hm=PH; wm=PH*as; } else { wm=PW; hm=PW/as; }
  const cw=wm/c.zoom, ch=hm/c.zoom;
  const cx=clamp(c.cx,cw/2,PW-cw/2), cy=clamp(c.cy,ch/2,PH-ch/2);
  out.pos.fromArray(CAL.pos); out.quat.fromArray(CAL.quat);
  out.fov=2*Math.atan(Math.tan(CAL.fov*D2R/2)*ch/PH)/D2R;
  out.sx=(cx-PW/2)/cw*w; out.sy=(cy-PH/2)/ch*h;
  return out;
}
function productCamState(out){
  const w=size.w,h=size.h;
  const fov=w/h<.9?46:32, vt=Math.tan(fov*D2R/2);
  const sx=mobile()?0:436/2, sy=mobile()?h*.56/2:42; // leave room for the sheet and the band
  const availW=Math.max(200,w-Math.abs(sx)*2), ht=vt*(availW/h);
  const dist=(orbit.W/2)/ht, Pp=orbit.polar*D2R, A=orbit.az*D2R;
  out.pos.set(orbit.tx+dist*Math.sin(Pp)*Math.sin(A),orbit.ty+dist*Math.cos(Pp),orbit.tz+dist*Math.sin(Pp)*Math.cos(A));
  tmpObj.position.copy(out.pos); tmpObj.up.set(0,1,0); tmpObj.lookAt(orbit.tx,orbit.ty,orbit.tz); out.quat.copy(tmpObj.quaternion);
  out.fov=fov; out.sx=sx; out.sy=sy; return out;
}
function applyCamera(){
  storyCamState(camA);
  const t=ease(trans);
  if(t>0){ productCamState(camB); }
  camera.position.copy(camA.pos).lerp(camB.pos,t);
  camera.quaternion.copy(camA.quat).slerp(camB.quat,t);
  camera.fov=lerp(camA.fov,camB.fov,t);
  camera.aspect=size.w/size.h;
  camera.setViewOffset(size.w,size.h,lerp(camA.sx,camB.sx,t),lerp(camA.sy,camB.sy,t),size.w,size.h);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  // the photo only matches the solved camera: fade it out as soon as we leave
  plateMat.uniforms.opacity.value=1-sstep(0,.3,trans);
  plate.visible=trans<.3;
  const d=sstep(.05,.45,trans); deskMat.opacity=d; desk3d.visible=d>0.001; deskMat.transparent=d<.999;
  $('#bg').classList.toggle('on',trans>.02);
}
function productOrbitTarget(){
  const v=P[pv.id].views[pv.view][1];
  let a=pv.anchor.clone();
  if(v.at==='corner') a=new THREE.Vector3(322,2,150);
  if(v.at==='hinge'){ const r=rails[0], q=r.pins[3]; a=new THREE.Vector3(stand.position.x+r.sx,stand.position.y+q.position.y,stand.position.z+q.position.z); }
  return {tx:a.x,ty:a.y,tz:a.z,W:v.W*pv.zoom,polar:clamp(v.polar+pv.drag.polar,3,88),az:v.az+pv.drag.az};
}
