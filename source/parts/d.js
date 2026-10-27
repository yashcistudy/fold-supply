
/* =========================================================
   R10: the room is the shop. Pages live on objects in the photo.
   ========================================================= */
(function(){
const css=`
.pg h2{font-size:38px;line-height:1.02;margin:0 0 12px;letter-spacing:-.01em}
.pg .lead{font-size:18px}
.pg h3{font:600 13px var(--display);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:26px 0 8px;border-top:1.5px solid var(--graphite);padding-top:12px}
.pg .tabs{display:flex;gap:22px;border-bottom:1px solid #CFCDC8;margin:18px 0 6px}
.pg .tabs button{background:none;border:0;padding:10px 0;font:600 15px var(--display);color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;min-height:44px;position:relative}
.pg .tabs button[aria-selected="true"]{color:var(--graphite);border-bottom-color:var(--graphite)}
.pg .tabs button[aria-selected="true"]::after{content:"";position:absolute;right:-10px;top:8px;width:8px;height:8px;background:var(--felt);clip-path:polygon(0 0,100% 0,100% 100%)}
.pg dl{display:grid;grid-template-columns:150px minmax(0,1fr);margin:0;font-size:16px}
.pg dt,.pg dd{margin:0;padding:10px 0;border-bottom:1px solid #CFCDC8}
.pg dt{color:var(--muted)}
.pg .row{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #CFCDC8}
.pg .row img{width:36px;height:36px}
.pg .row b{font:600 18px var(--display);display:block}
.pg .row small{color:var(--muted);font-size:15px}
.pg .row .pr{font:700 19px var(--body);text-align:right}
.pg .row .acts{grid-column:2/-1;display:flex;gap:18px}
.pg .link{background:none;border:0;padding:6px 0;font:600 15px var(--display);color:var(--graphite);border-bottom:2px solid var(--graphite);cursor:pointer;min-height:36px}
.pg .qty{display:flex;align-items:center;gap:0;border:1.5px solid var(--graphite)}
.pg .qty button{width:40px;height:40px;background:none;border:0;font:600 18px var(--display);cursor:pointer;color:var(--graphite)}
.pg .qty span{min-width:28px;text-align:center;font:700 16px var(--body)}
.pg .tot{display:grid;grid-template-columns:1fr auto;font-size:17px;margin-top:10px}
.pg .tot span{padding:6px 0}
.pg .tot .big{font:700 24px var(--body);border-top:1.5px solid var(--graphite);padding-top:10px}
.pg .swap{border:1.5px dashed var(--graphite);padding:14px 16px;margin:16px 0;font-size:16px}
.pg label{display:block;font:600 14px var(--display);margin:14px 0 6px}
.pg input[type=text],.pg input[type=email]{width:100%;height:46px;border:1.5px solid var(--graphite);background:#fff;padding:0 12px;font:17px var(--body);color:var(--graphite);border-radius:0}
.pg input[aria-invalid="true"]{border-color:#B42318;border-width:2px}
.pg .err{color:#B42318;font-size:15px;margin:6px 0 0;display:flex;gap:8px;align-items:flex-start}
.pg .err::before{content:"!";flex:none;width:18px;height:18px;background:#B42318;color:#fff;font:700 13px/18px var(--display);text-align:center;margin-top:2px}
.pg .note{font-size:14px;color:var(--muted)}
.pg .bigstop{display:block;width:64px;height:64px;position:relative;margin:4px 0 18px}
.pg .bigstop::before,.pg .bigstop::after{content:"";position:absolute;inset:0}
.pg .bigstop::before{background:var(--silver);clip-path:polygon(0 0,100% 0,0 100%)}
.pg .bigstop::after{background:var(--felt);clip-path:polygon(0 100%,100% 100%,100% 0)}
.pg .bigstop.go::after{animation:fold .24s cubic-bezier(.3,.7,.3,1)}
.pin.room span{background:rgba(30,31,33,.82);color:var(--studio-white)}
.pin.room em{border-radius:0;width:9px;height:9px}
@media (max-width:760px){ html.locked #toast{top:64px!important;bottom:auto!important} }
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

/* ---- where each page lives in the photo (plate pixels) ---- */
const PAGES={
  shop:{px:[1536,1080],zoom:1.0,label:'Shop'},
  help:{px:[318,1196],zoom:1.9,label:'Help and care',pin:'Help and care'},
  approach:{px:[2095,330],zoom:1.7,label:'Our approach',pin:'Our approach'},
  delivery:{px:[2860,760],zoom:1.55,label:'Delivery and returns',pin:'Delivery and returns'},
  bag:{px:[1536,1080],zoom:1.0,label:'Bag'},
  checkout:{px:[1536,1080],zoom:1.0,label:'Checkout'},
  done:{px:[1536,1080],zoom:1.0,label:'Order placed'}
};
const ROOM_PINS={help:[318,1150],approach:[2250,380],delivery:[2930,620],lamp:[540,660]};
let page=null, pageT=0, pagePushed=false, pageFocus=null;

/* camera: crop in on the object, and shift it clear of the sheet */
const _storyCrop=storyCrop;
storyCrop=function(p){
  const c=_storyCrop(p);
  if(pageT<=0||!page) return c;
  const t=ease(pageT), q=PAGES[page];
  return {cx:lerp(c.cx,q.px[0],t),cy:lerp(c.cy,q.px[1],t),zoom:Math.exp(lerp(Math.log(c.zoom),Math.log(q.zoom),t))};
};
const _storyCamState=storyCamState;
storyCamState=function(out){ _storyCamState(out); if(pageT>0){ const t=ease(pageT); if(mobile()) out.sy+=t*size.h*.25; else out.sx+=t*218; } return out; };
let lastCrop={x0:0,y0:0,cw:CAL.W,ch:CAL.H};
function plateToScreen(px,py){
  const w=size.w,h=size.h,as=w/h,PW=CAL.W,PH=CAL.H, c=storyCrop(pCur);
  let wm,hm; if(as<=PW/PH){ hm=PH; wm=PH*as; } else { wm=PW; hm=PW/as; }
  const cw=wm/c.zoom, ch=hm/c.zoom, cx=clamp(c.cx,cw/2,PW-cw/2), cy=clamp(c.cy,ch/2,PH-ch/2);
  let x=(px-(cx-cw/2))/cw*w, y=(py-(cy-ch/2))/ch*h;
  if(pageT>0){ const t=ease(pageT); if(mobile()) y-=t*size.h*.25; else x-=t*218; }
  return [x,y];
}

/* room pins: the objects are the second route; the band always names them too */
const roomPins={};
for(const k in ROOM_PINS){
  const b=document.createElement('button'); b.type='button'; b.className='pin room hide';
  const label=k==='lamp'?'Finish the day':PAGES[k].pin;
  b.innerHTML=`<span>${label}</span><i></i><em></em>`;
  b.setAttribute('aria-label',k==='lamp'?'Turn the lamp on and see the evening':`Open ${label}`);
  b.addEventListener('click',()=>{ if(k==='lamp'){ goToP(pCur>=.9?.6:.96); } else openPage(k); });
  $('#pins').appendChild(b); roomPins[k]=b;
}
const _overlays=overlays;
overlays=function(){
  _overlays();
  const ex=mode==='story'&&trans===0&&!page&&EXPLORE(pCur)&&!mobile(); // phones: the band and the page links carry these
  for(const k in roomPins){
    const b=roomPins[k], s=plateToScreen(...ROOM_PINS[k]);
    if(k==='lamp') b.firstElementChild.textContent=pCur>=.9?'Back to the morning':'Finish the day';
    b.classList.toggle('hide',!ex); b.tabIndex=ex?0:-1; b.setAttribute('aria-hidden',ex?'false':'true');
    b.style.left=s[0]+'px'; b.style.top=s[1]+'px';
    if(ex){ const sp=b.firstElementChild, half=sp.offsetWidth/2; let dx=0; if(s[0]-half<8) dx=8-(s[0]-half); else if(s[0]+half>size.w-8) dx=size.w-8-(s[0]+half); sp.style.transform=`translateX(${dx.toFixed(1)}px)`; }
  }
};

/* ---- bag helpers ---- */
function counts(){ const c={}; for(const k of bag) c[k]=(c[k]||0)+1; return c; }
function totals(){ const sub=bag.reduce((s,k)=>s+P[k].price,0); const del=sub===0?0:(sub>=75?0:4.95); return {sub,del,total:sub+del}; }
function syncBag(){ if(bag.length) sealed=false; const n=bag.length, t=totals(); const b=$('#bagChip'); b.textContent=n?`Bag · ${n} · ${money(t.sub)}`:'Bag · 0'; b.classList.toggle('has',n>0); b.setAttribute('aria-label',n?`Bag, ${n} item${n>1?'s':''}, ${money(t.sub)}`:'Bag, empty'); }
$('#bagChip').replaceWith($('#bagChip').cloneNode(true)); // drop the old toast-only handler
$('#bagChip').addEventListener('click',()=>openPage('bag'));
const ICON={mat:'mat-flat',stand:'stand-open',clips:'clip-on',set:'desk-set'};
const SIZE={mat:'700 × 350 × 3 mm felt',stand:'Opens to 110 mm, folds to 22 mm',clips:'2 clips, 3 channels each',set:'Mat, stand and clips pair'};

/* ---- page content ---- */
let helpTab='care', form={email:'',name:'',line1:'',town:'',postcode:''}, errs={}, lastOrder=null;
function render(){
  const t=totals(), c=counts();
  if(page==='shop') return `<p class="eyebrow">Shop</p><h2 id="pvName" tabindex="-1">Three things, sized for the desk you’ve got<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
    <p class="lead">Every size is listed before the price. Open one to see it at work on the desk.</p>
    ${['mat','stand','clips','set'].map(k=>`<div class="row"><img src="assets/brand/icon-${ICON[k]}.svg" alt=""><div><b>${P[k].name}</b><small>${SIZE[k]}</small></div><span class="pr">${money(P[k].price)}${k==='set'?'<br><small><s>£86</s></small>':''}</span>
      <div class="acts"><button class="link" type="button" data-open="${k}">Look closer</button><button class="link" type="button" data-add="${k}">Add to bag</button></div></div>`).join('')}
    <p class="note" style="margin-top:14px">Delivery £4.95, free from £75. The Desk Set always ships free.</p>`;
  if(page==='help') return `<p class="eyebrow">The notebook</p><h2 id="pvName" tabindex="-1">Help and care</h2>
    <div class="tabs" role="tablist">${[['care','Care'],['fit','Fit'],['contact','Contact']].map(([k,n])=>`<button role="tab" type="button" data-tab="${k}" aria-selected="${helpTab===k}">${n}</button>`).join('')}</div>
    ${helpTab==='care'?`<h3>Desk Mat</h3><p>${P.mat.care}</p><h3>Folding Laptop Stand</h3><p>${P.stand.care}</p><h3>Cable Clips Pair</h3><p>${P.clips.care}</p>`:''}
    ${helpTab==='fit'?`<h3>Desk Mat</h3><p>It needs 700 × 350 mm of flat desk. On a desk 90 to 120 cm wide, that leaves room either side for a lamp or a notebook.</p><h3>Folding Laptop Stand</h3><p>Check that your laptop’s base sits across both rails and both silicone pads. Open, it needs 250 × 220 mm.</p><h3>Cable Clips Pair</h3><p>Each channel takes a cable 3 to 5 mm across. This range is still being tested.</p>`:''}
    ${helpTab==='contact'?`<h3>Email</h3><p>help@foldsupply.example <span class="note">(placeholder address for this prototype)</span></p><p>Include your order reference, starting FS-, so we can find it quickly.</p><h3>Returns</h3><p>See <button class="link" type="button" data-go="delivery">delivery and returns</button>.</p>`:''}`;
  if(page==='approach') return `<p class="eyebrow">The framed print</p><h2 id="pvName" tabindex="-1">Our approach</h2>
    <p class="lead">Fold Supply makes three things for the desk you work at and then live at.</p>
    <h3>Make room</h3><p>Things take less space when work’s done. The stand folds to 22 mm and the mat rolls up.</p>
    <h3>Know what fits</h3><p>Sizes come first, in millimetres, before the price.</p>
    <h3>Finish the day</h3><p>Everything has a put-away state, so the desk can be a table again at six.</p>
    <h3>What we don’t claim</h3><p>No recycled-content, carbon or lifetime claims: we don’t have the evidence for them. Materials would be confirmed with the supplier before a real launch.</p>`;
  if(page==='delivery') return `<p class="eyebrow">The window</p><h2 id="pvName" tabindex="-1">Delivery and returns</h2>
    <dl><dt>Delivery</dt><dd>£4.95, or free from £75</dd><dt>Dispatch</dt><dd>1 to 2 working days</dd><dt>Arrives</dt><dd>2 to 4 working days after dispatch</dd><dt>Change of mind</dt><dd>Ask to return within 30 days of delivery. Return postage is yours.</dd><dt>Faulty item</dt><dd>We arrange the return or a replacement, at our cost.</dd></dl>
    <p class="note" style="margin-top:12px">This is a fictional shop. The policy is a design premise and doesn’t replace your statutory rights.</p>`;
  if(page==='bag'){
    if(!bag.length) return `<p class="eyebrow">Bag</p><h2 id="pvName" tabindex="-1">Nothing in it yet</h2><p class="lead">Open anything on the desk to look closer, or see all three in the shop.</p><button class="btn add" type="button" data-go="shop">Go to the shop</button>`;
    const canSwap=c.mat&&c.stand&&c.clips;
    return `<p class="eyebrow">Bag</p><h2 id="pvName" tabindex="-1">Your bag</h2>
      ${Object.keys(c).map(k=>`<div class="row"><img src="assets/brand/icon-${ICON[k]}.svg" alt=""><div><b>${P[k].name}</b><small>${SIZE[k]}</small></div><span class="pr">${money(P[k].price*c[k])}</span>
        <div class="acts"><div class="qty" role="group" aria-label="Quantity of ${P[k].name}"><button type="button" data-dec="${k}" aria-label="One fewer">−</button><span aria-live="polite">${c[k]}</span><button type="button" data-inc="${k}" aria-label="One more" ${c[k]>=5?'disabled':''}>+</button></div><button class="link" type="button" data-rm="${k}">Remove</button></div></div>`).join('')}
      ${canSwap?`<div class="swap"><b class="d" style="font-family:var(--display)">You have all three.</b> Swap them for the Desk Set and save £10. <button class="link" type="button" data-swap="1">Swap to the Desk Set</button></div>`:''}
      <div class="tot"><span>Subtotal</span><span>${money(t.sub)}</span><span>Delivery</span><span>${t.del?money(t.del):'Free'}</span><span class="big">Total</span><span class="big">${money(t.total)}</span></div>
      ${t.sub<75?`<p class="note">${money(75-t.sub)} more and delivery is free.</p>`:''}
      <button class="btn add" type="button" data-go="checkout">Checkout · ${money(t.total)}</button>`;
  }
  if(page==='checkout'){
    const f=(id,lab,type,ac)=>`<label for="f-${id}">${lab}</label><input id="f-${id}" type="${type||'text'}" autocomplete="${ac}" value="${form[id].replace(/"/g,'&quot;')}" ${errs[id]?`aria-invalid="true" aria-describedby="e-${id}"`:''}>${errs[id]?`<p class="err" id="e-${id}">${errs[id]}</p>`:''}`;
    return `<p class="eyebrow">Checkout</p><h2 id="pvName" tabindex="-1">Where should it go?</h2>
      <form id="co" novalidate>${f('email','Email','email','email')}${f('name','Full name','text','name')}${f('line1','Address','text','address-line1')}${f('town','Town or city','text','address-level2')}${f('postcode','Postcode','text','postal-code')}
      <div class="tot" style="margin-top:20px"><span>Items</span><span>${money(t.sub)}</span><span>Delivery</span><span>${t.del?money(t.del):'Free'}</span><span class="big">Total</span><span class="big">${money(t.total)}</span></div>
      <p class="note">Prototype: no payment is taken and nothing is sent.</p>
      <button class="btn add" type="submit">Place order · ${money(t.total)}</button></form>`;
  }
  if(page==='done'){ const o=lastOrder; return `<span class="bigstop ${RM?'':'go'}" aria-hidden="true"></span><p class="eyebrow">Order ${o.ref}</p><h2 id="pvName" tabindex="-1">That’s work done<img class="stop" src="assets/brand/fold-stop.svg" alt="."></h2>
    <p class="lead">${o.items} on the way to ${o.town}, ${o.postcode}. It’s dispatched in 1 to 2 working days.</p>
    <dl><dt>Paid</dt><dd>${money(o.total)} <span class="note">(prototype, nothing charged)</span></dd><dt>Confirmation</dt><dd>A real shop would email ${o.email}</dd></dl>
    <button class="btn add" type="button" data-go="desk">Back to the desk</button>`; }
  return '';
}
const MORE=`<p class="note" style="margin-top:22px;display:flex;flex-wrap:wrap;gap:6px 18px">${[['shop','Shop'],['approach','Our approach'],['help','Help and care'],['delivery','Delivery and returns'],['about','About this project'],['contact','Contact']].map(([k,n])=>`<button class="link" type="button" data-go="${k}">${n}</button>`).join('')}</p>`;
function draw2(focus){ panel.innerHTML=`<div class="pg">${render()}${['help','approach','delivery','shop','about','contact'].includes(page)?MORE.replace(`data-go="${page}"`,`data-go="${page}" aria-current="page" hidden`):''}</div>`; panel.scrollTop=0; if(focus) setTimeout(()=>{ const h=$('#pvName'); if(h) h.focus({preventScroll:true}); },RM?0:300); }

function openPage(id){
  if(id==='desk'){ closePage(); return; }
  if(mode==='product'){ const f=lastFocus; closeProduct(true); pagePushed=true; pageFocus=f; }
  else if(!page) pageFocus=document.activeElement;
  page=id; errs={}; mode='page';
  pvEl.hidden=false; $('#pvHint').style.display='none'; document.documentElement.classList.add('locked');
  uiEl.inert=true; uiEl.classList.add('gone'); syncBand(id==='checkout'||id==='done'?'bag':id);
  if(!RM&&!SNAP){ panel.classList.remove('unfold'); void panel.offsetWidth; panel.classList.add('unfold'); }
  draw2(true);
  if(!pagePushed){ history.pushState({pg:id},'','#'+id); pagePushed=true; } else history.replaceState({pg:id},'','#'+id);
  kick();
}
window.openPage=openPage;
const _addToBag=addToBag; addToBag=function(id){ _addToBag(id); syncBag(); };
try{ history.scrollRestoration='manual'; }catch(e){}
/* a product opened from a page takes over the page's history entry */
const _openProduct=openProduct;
openProduct=function(id,swap){ if(page){ const f=pageFocus; closePage(true); pushed=true; _openProduct(id,true); lastFocus=f; return; } _openProduct(id,swap); };
function closePage(fromPop){
  if(!page) return;
  page=null; mode='story'; pvEl.hidden=true; $('#pvHint').style.display=''; document.documentElement.classList.remove('locked');
  uiEl.inert=false; uiEl.classList.remove('gone'); syncBand('desk');
  if(pagePushed&&!fromPop){ pagePushed=false; const y=scrollY; history.back(); requestAnimationFrame(()=>scrollTo(0,y)); setTimeout(()=>{ scrollTo(0,y); readScroll(); },60); } else pagePushed=false;
  if(pageFocus&&document.contains(pageFocus)) pageFocus.focus({preventScroll:true});
  kick();
}
$('#pvBack').addEventListener('click',()=>{ if(page) closePage(); },true);
addEventListener('keydown',e=>{ if(e.key==='Escape'&&page&&$('#lb').hidden) closePage(); });
addEventListener('popstate',()=>{ if(page) closePage(true); });

/* animate the page crop in and out */
(function tick(){ const target=page?1:0; if(pageT!==target){ pageT=(RM||SNAP)?target:clamp(pageT+(target>pageT?1:-1)/36,0,1); kick(); } requestAnimationFrame(tick); })();

/* sheet interactions */
panel.addEventListener('click',e=>{
  if(!page) return;
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.tab){ helpTab=b.dataset.tab; draw2(); panel.querySelector(`[data-tab="${helpTab}"]`).focus(); return; }
  if(b.dataset.go){ e.stopPropagation(); if(b.dataset.go==='desk'){ closePage(); } else openPage(b.dataset.go); return; }
  if(b.dataset.open){ e.stopPropagation(); openProduct(b.dataset.open); return; }
  if(b.dataset.add){ e.stopPropagation(); addToBag(b.dataset.add); syncBag(); return; }
  const k=b.dataset.inc||b.dataset.dec||b.dataset.rm;
  if(b.dataset.inc){ if(counts()[k]<5) bag.push(k); }
  else if(b.dataset.dec){ bag.splice(bag.indexOf(k),1); }
  else if(b.dataset.rm){ for(let i=bag.length-1;i>=0;i--) if(bag[i]===k) bag.splice(i,1); }
  else if(b.dataset.swap){ for(const x of ['mat','stand','clips']) bag.splice(bag.indexOf(x),1); bag.push('set'); toast('Swapped to the Desk Set. You save £10 and delivery is free.',true); }
  else return;
  e.stopPropagation(); syncBag(); draw2(); const again=panel.querySelector(`[data-${b.dataset.inc?'inc':b.dataset.dec?'dec':'x'}="${k}"]`); if(again) again.focus();
},true);
panel.addEventListener('input',e=>{ if(page==='checkout'&&e.target.id&&e.target.id.startsWith('f-')) form[e.target.id.slice(2)]=e.target.value; },true);
panel.addEventListener('submit',e=>{
  if(page!=='checkout') return; e.preventDefault();
  errs={};
  if(!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email='Enter an email address, like name@example.com, so we can send the confirmation.';
  if(!form.name.trim()) errs.name='Enter the name for the delivery.';
  if(!form.line1.trim()) errs.line1='Enter the first line of the address.';
  if(!form.town.trim()) errs.town='Enter the town or city.';
  const pc=form.postcode.trim().toUpperCase().replace(/\s+/g,' ');
  if(!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(pc)) errs.postcode='Enter a full UK postcode, like SW1A 1AA. We need it to work out delivery.';
  if(Object.keys(errs).length){ draw2(); const first=panel.querySelector('[aria-invalid="true"]'); if(first) first.focus(); toast(`Check ${Object.keys(errs).length===1?'one detail':Object.keys(errs).length+' details'} before placing the order.`); return; }
  const c=counts(), t=totals();
  lastOrder={ref:'FS-'+String(Math.floor(1000+Math.random()*9000)),items:Object.keys(c).map(k=>`${c[k]>1?c[k]+' × ':''}${P[k].name}`).join(', '),town:form.town.trim(),postcode:pc,email:form.email.trim(),total:t.total};
  bag.length=0; syncBag(); sealed=true;
  page='done'; draw2(true); history.replaceState({pg:'done'},'','#done');
  // the lamp comes on: finish the day
  const tr=$('#track'), max=tr.offsetHeight-innerHeight; scrollTo({top:tr.offsetTop+.96*max,behavior:'auto'}); pTarget=.96; if(RM||SNAP) pCur=.96; kick();
},true);
{ const h0=location.hash.slice(1); if(['shop','help','approach','delivery','bag','about','contact'].includes(h0)) setTimeout(()=>openPage(h0),RM?0:1000); }
/* ---- the kraft box: the bag lives on the desk ---- */
const KRAFT=new THREE.MeshStandardMaterial({color:0xA27B4F,roughness:.9,metalness:0,envMapIntensity:.45});
const KRAFT_IN=new THREE.MeshStandardMaterial({color:0xA8875F,roughness:.92,envMapIntensity:.4});
const BX={x:452,z:212,w:130,d:96,h:60,t:2};
const boxG=new THREE.Group(); boxG.position.set(BX.x,0,BX.z); boxG.rotation.y=.22; scene.add(boxG);
const boxBody=new THREE.Group(); boxG.add(boxBody);
const wall=(w,h,d,x,y,z,m)=>{ const o=mk(new THREE.BoxGeometry(w,h,d),m||KRAFT); o.position.set(x,y,z); boxBody.add(o); return o; };
wall(BX.w,BX.t,BX.d,0,BX.t/2,0,KRAFT_IN);
wall(BX.w,BX.h,BX.t,0,BX.h/2,BX.d/2-BX.t/2); wall(BX.w,BX.h,BX.t,0,BX.h/2,-BX.d/2+BX.t/2);
wall(BX.t,BX.h,BX.d,BX.w/2-BX.t/2,BX.h/2,0); wall(BX.t,BX.h,BX.d,-BX.w/2+BX.t/2,BX.h/2,0);
const lidP=new THREE.Group(); lidP.position.set(0,BX.h,-BX.d/2); boxBody.add(lidP);
const lid=mk(new THREE.BoxGeometry(BX.w+3,BX.t,BX.d+2),KRAFT); lid.position.set(0,BX.t/2,BX.d/2+1); lidP.add(lid);
const flap=mk(new THREE.BoxGeometry(BX.w+3,16,BX.t),KRAFT); flap.position.set(0,-7,BX.d+2); lidP.add(flap);
const stCan=document.createElement('canvas'); stCan.width=stCan.height=128; { const g=stCan.getContext('2d'); g.fillStyle='#C9CACC'; g.beginPath(); g.moveTo(0,0); g.lineTo(128,0); g.lineTo(0,128); g.fill(); g.fillStyle='#3A3B3D'; g.beginPath(); g.moveTo(0,128); g.lineTo(128,128); g.lineTo(128,0); g.fill(); }
const stTex=new THREE.CanvasTexture(stCan); stTex.colorSpace=THREE.SRGBColorSpace;
const sticker=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshStandardMaterial({map:stTex,roughness:.5,envMapIntensity:.5}));
sticker.position.set(0,-6,BX.d+3.1); lidP.add(sticker);
let boxT=0, lidT=1, sealed=false;
const boxWorld=new THREE.Vector3(BX.x,BX.h*.6,BX.z);
{ const v=boxWorld.clone().project(calCam); const bp=[(v.x+1)/2*CAL.W,(1-v.y)/2*CAL.H]; for(const k of ['bag','checkout','done']){ PAGES[k].px=bp; PAGES[k].zoom=1.55; } }
const boxPin=document.createElement('button'); boxPin.type='button'; boxPin.className='pin room hide'; boxPin.innerHTML='<span>Bag</span><i></i><em></em>';
boxPin.addEventListener('click',()=>openPage('bag')); $('#pins').appendChild(boxPin);
const _ov2=overlays;
overlays=function(){
  _ov2();
  const ex=mode==='story'&&trans===0&&!page&&boxT>.95&&!mobile();
  const sc=toScreen(BX.x,BX.h+14,BX.z);
  boxPin.firstElementChild.textContent=sealed?(lastOrder?`Order ${lastOrder.ref} · packed`:'Packed'):`Bag · ${bag.length} · ${money(totals().sub)}`;
  boxPin.classList.toggle('hide',!ex||!sc[2]); boxPin.tabIndex=ex?0:-1; boxPin.setAttribute('aria-hidden',ex?'false':'true');
  boxPin.setAttribute('aria-label',sealed?'Your order, packed. Open the bag':'Open the bag');
  boxPin.style.left=sc[0]+'px'; boxPin.style.top=sc[1]+'px';
};
(function boxTick(){
  const tB=(bag.length>0||sealed)?1:0, tL=sealed?0:1, k=(RM||SNAP)?1:1/30;
  let moved=false;
  if(boxT!==tB){ boxT=Math.abs(tB-boxT)<k?tB:boxT+Math.sign(tB-boxT)*k; moved=true; }
  if(lidT!==tL){ lidT=Math.abs(tL-lidT)<k*.8?tL:lidT+Math.sign(tL-lidT)*k*.8; moved=true; }
  const e=ease(boxT);
  boxG.visible=boxT>0&&trans<.01; boxBody.scale.set(1,Math.max(.001,e),1); boxG.position.y=0;
  lidP.rotation.x=-ease(lidT)*1.95; sticker.visible=sealed&&lidT<.05;
  if(moved) kick();
  requestAnimationFrame(boxTick);
})();

})();
