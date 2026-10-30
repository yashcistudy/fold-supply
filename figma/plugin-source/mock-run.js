// A strict stand-in for the Figma plugin API, to catch mistakes before Yas runs the plugin.
const fs=require('fs'), vm=require('vm');
const mode=process.argv[2]||'normal'; // 'normal' | 'nofonts' | 'noimages' | 'onemode'
let id=0, closed=null; const loaded=new Set(['Inter|Regular']); const log=[];
const available=new Set(['Inter|Regular','Inter|Medium','Inter|Semi Bold','Inter|Bold','Inter|Italic','Georgia|Regular','Georgia|Bold','Georgia|Italic']);
if(mode!=='nofonts'){ for(const s of ['Semibold','Medium','Regular','Bold']) available.add('Chillax|'+s); for(const s of ['Regular','Bold','Italic']) available.add('Gentium Book Plus|'+s); }
const fail=m=>{ throw new Error('MOCK: '+m); };
const ENUM={primaryAxisAlignItems:['MIN','MAX','CENTER','SPACE_BETWEEN'],counterAxisAlignItems:['MIN','MAX','CENTER','BASELINE'],layoutMode:['NONE','HORIZONTAL','VERTICAL','GRID'],
  primaryAxisSizingMode:['FIXED','AUTO'],counterAxisSizingMode:['FIXED','AUTO'],textAutoResize:['NONE','WIDTH_AND_HEIGHT','HEIGHT','TRUNCATE'],textAlignHorizontal:['LEFT','CENTER','RIGHT','JUSTIFIED'],
  textCase:['ORIGINAL','UPPER','LOWER','TITLE','SMALL_CAPS','SMALL_CAPS_FORCED'],textDecoration:['NONE','UNDERLINE','STRIKETHROUGH'],layoutWrap:['NO_WRAP','WRAP'],strokeCap:['NONE','ROUND','SQUARE','ARROW_LINES','ARROW_EQUILATERAL'],
  layoutSizingHorizontal:['FIXED','HUG','FILL'],layoutPositioning:['AUTO','ABSOLUTE']};
function checkPaints(ps,where){ if(!Array.isArray(ps)) fail(where+' paints must be an array'); for(const p of ps){ if(p.type==='SOLID'){ const c=p.color; if(!c||'a' in c) fail(where+' SOLID color must be {r,g,b} without a'); for(const k of ['r','g','b']) if(!(c[k]>=0&&c[k]<=1)) fail(where+' colour out of range'); }
  else if(p.type==='IMAGE'){ if(!p.imageHash) fail('IMAGE paint without hash'); if(!['FILL','FIT','CROP','TILE'].includes(p.scaleMode)) fail('bad scaleMode'); } else fail('unknown paint '+p.type); } }
class Node{
  constructor(type){ this.id=String(++id); this.type=type; this.name=type; this.children=[]; this.parent=null; this._w=100; this._h=100; this.x=0; this.y=0; this.layoutMode='NONE'; this._fills=[]; this._strokes=[]; this.effects=[]; this.visible=true; }
  get width(){ return this._w; } get height(){ return this._h; }
  resize(w,h){ if(!(w>=0.01)||(!(h>=0.01)&&this.type!=='LINE')) fail(`resize(${w},${h}) on ${this.type} ${this.name}`); this._w=w; this._h=h; if(this.layoutMode&&this.layoutMode!=='NONE'){ this.primaryAxisSizingMode='FIXED'; this.counterAxisSizingMode='FIXED'; } if(this.type==='TEXT'&&this.textAutoResize&&this.textAutoResize!=='TRUNCATE') this.textAutoResize='NONE'; }
  rescale(k){ if(!(k>0)) fail('rescale k'); this._w*=k; this._h*=k; }
  appendChild(c){ if(this.type==='TEXT'||this.type==='RECTANGLE'||this.type==='LINE'||this.type==='ELLIPSE'||this.type==='VECTOR') fail('appendChild on '+this.type); if(c.parent){ const i=c.parent.children.indexOf(c); c.parent.children.splice(i,1);} c.parent=this; this.children.push(c); if(this.layoutMode&&this.layoutMode!=='NONE') this._reflow(); }
  insertChild(i,c){ this.appendChild(c); this.children.pop(); this.children.splice(i,0,c); }
  remove(){ if(this.parent){ this.parent.children.splice(this.parent.children.indexOf(this),1); this.parent=null; } }
  _reflow(){ // rough hug sizes so later width-dependent code has numbers to work with
    const kids=this.children.filter(k=>k.layoutPositioning!=='ABSOLUTE');
    const pad=[this.paddingTop||0,this.paddingRight||0,this.paddingBottom||0,this.paddingLeft||0], gap=this.itemSpacing||0;
    if(this.layoutMode==='VERTICAL'){ const h=kids.reduce((s,k)=>s+k.height,0)+gap*Math.max(0,kids.length-1)+pad[0]+pad[2]; if(this.primaryAxisSizingMode==='AUTO') this._h=Math.max(1,h); if(this.counterAxisSizingMode==='AUTO') this._w=Math.max(1,Math.max(0,...kids.map(k=>k.width))+pad[1]+pad[3]); }
    else { const w=kids.reduce((s,k)=>s+k.width,0)+gap*Math.max(0,kids.length-1)+pad[1]+pad[3]; if(this.primaryAxisSizingMode==='AUTO'&&this.layoutWrap!=='WRAP') this._w=Math.max(1,w); if(this.counterAxisSizingMode==='AUTO') this._h=Math.max(1,Math.max(0,...kids.map(k=>k.height))+pad[0]+pad[2]); }
    if(this.parent&&this.parent.layoutMode&&this.parent.layoutMode!=='NONE') this.parent._reflow(); }
  set fills(v){ checkPaints(v,this.type+' '+this.name+' fills'); this._fills=v; } get fills(){ return this._fills; }
  set strokes(v){ checkPaints(v,this.type+' strokes'); this._strokes=v; } get strokes(){ return this._strokes; }
  findAll(fn){ const out=[]; const walk=n=>{ for(const c of n.children){ if(fn(c)) out.push(c); walk(c);} }; walk(this); return out; }
  findOne(fn){ return this.findAll(fn)[0]||null; }
  findAllWithCriteria(c){ return this.findAll(n=>c.types.includes(n.type)); }
  async loadAsync(){}
  get hasMissingFont(){ return false; }
  getRangeAllFontNames(){ return [this.fontName]; }
}
const strictProps=['primaryAxisAlignItems','counterAxisAlignItems','layoutMode','primaryAxisSizingMode','counterAxisSizingMode','textAutoResize','textAlignHorizontal','textCase','textDecoration','layoutWrap','strokeCap','layoutSizingHorizontal','layoutPositioning'];
function make(type){
  const n=new Node(type);
  return new Proxy(n,{ set(t,k,v){
    if(strictProps.includes(k)&&!ENUM[k].includes(v)) fail(`${k}=${v} is not valid`);
    if(k==='layoutWrap'&&v==='WRAP'&&t.layoutMode!=='HORIZONTAL') fail('layoutWrap WRAP needs HORIZONTAL');
    if(k==='counterAxisSpacing'&&t.layoutWrap!=='WRAP') fail('counterAxisSpacing needs layoutWrap WRAP first');
    if(k==='counterAxisAlignItems'&&v==='BASELINE'&&t.layoutMode!=='HORIZONTAL') fail('BASELINE needs HORIZONTAL');
    if(['layoutSizingHorizontal','layoutPositioning','layoutGrow'].includes(k)&&!(t.parent&&t.parent.layoutMode&&t.parent.layoutMode!=='NONE')) fail(`${k} needs an auto-layout parent (${t.name})`);
    if(k==='layoutSizingHorizontal'&&v==='FILL'&&t.parent.layoutMode==='VERTICAL'&&t.parent.counterAxisSizingMode==='AUTO'&&!(t.parent.layoutSizingHorizontal==='FILL')) log.push(`warn: FILL child "${t.name}" in hugging parent "${t.parent.name}"`);
    if(k==='textStyleId') fail('textStyleId setter is not allowed with dynamic-page; use setTextStyleIdAsync');
    if(k==='characters'){ if(!loaded.has(t.fontName.family+'|'+t.fontName.style)) fail(`characters set before font ${t.fontName.family} ${t.fontName.style} was loaded`); t._h=Math.max(14,(t.fontSize||16)*1.3*Math.ceil(String(v).length*(t.fontSize||16)*0.5/Math.max(40,t._w||400))); t._w=Math.min(1200,String(v).length*(t.fontSize||16)*0.5); }
    if(k==='fontName'&&!loaded.has(v.family+'|'+v.style)) fail('fontName set to unloaded font '+v.family+' '+v.style);
    if((k==='fontSize'||k==='lineHeight'||k==='letterSpacing'||k==='textCase'||k==='textDecoration')&&t.type==='TEXT'&&t.characters&&!loaded.has(t.fontName.family+'|'+t.fontName.style)) fail(k+' on text with unloaded font');
    if(k==='effects'){ for(const e of v){ if(e.type==='DROP_SHADOW'){ for(const f of ['color','offset','radius','visible','blendMode']) if(!(f in e)) fail('DROP_SHADOW missing '+f); } } }
    if(k==='vectorPaths'){ for(const p of v) if(!/^[MLZ0-9 .\-]+$/.test(p.data)) fail('bad vector path '+p.data); }
    t[k]=v; if(['paddingTop','paddingLeft','paddingRight','paddingBottom','itemSpacing','layoutMode'].includes(k)&&t.layoutMode!=='NONE') t._reflow(); return true; },
    get(t,k){ return t[k]; } });
}
function makeText(){ const t=make('TEXT'); t.fontName={family:'Inter',style:'Regular'}; t.fontSize=12; t.characters=''; t.setTextStyleIdAsync=async sid=>{ const st=styles[sid]; if(!st) fail('unknown text style'); if(!loaded.has(st.fontName.family+'|'+st.fontName.style)) fail('style font not loaded'); t.fontSize=st.fontSize; }; return t; }
const styles={};
let currentPage;
const root=make('DOCUMENT'); const firstPage=make('PAGE'); firstPage.name='Page 1'; root.appendChild(firstPage); currentPage=firstPage;
function comp(){ const c=make('COMPONENT'); c.createInstance=()=>{ const i=clone(c,'INSTANCE'); currentPage.appendChild(i); return i; }; return c; }
function clone(n,type){ const c=make(type||n.type); c.name=n.name; c._w=n._w; c._h=n._h; c.layoutMode=n.layoutMode; for(const k of ['primaryAxisSizingMode','counterAxisSizingMode','itemSpacing','paddingTop','paddingLeft','paddingRight','paddingBottom']) if(n[k]!=null) c[k]=n[k];
  if(n.type==='TEXT'){ const t=makeText(); t.fontName=n.fontName; t.characters=n.characters; t.name=n.name; return t; }
  for(const ch of n.children){ const cc=clone(ch); cc.parent=c; c.children.push(cc); } return c; }
const collections=[];
const figma={
  editorType:'figma', root,
  get currentPage(){ return currentPage; }, set currentPage(v){ fail('figma.currentPage setter not allowed with dynamic-page'); },
  setCurrentPageAsync: async p=>{ currentPage=p; },
  loadFontAsync: async f=>{ const k=f.family+'|'+f.style; if(!available.has(k)) throw new Error('font not found '+k); loaded.add(k); },
  createText(){ const t=makeText(); currentPage.appendChild(t); return t; },
  createFrame(){ const f=make('FRAME'); f.fills=[{type:'SOLID',color:{r:1,g:1,b:1}}]; currentPage.appendChild(f); return f; },
  createRectangle(){ const r=make('RECTANGLE'); currentPage.appendChild(r); return r; },
  createEllipse(){ const r=make('ELLIPSE'); currentPage.appendChild(r); return r; },
  createLine(){ const r=make('LINE'); currentPage.appendChild(r); return r; },
  createVector(){ const r=make('VECTOR'); currentPage.appendChild(r); return r; },
  createComponent(){ const c=comp(); currentPage.appendChild(c); return c; },
  createPage(){ const p=make('PAGE'); root.appendChild(p); return p; },
  createNodeFromSvg(s){ if(!/^<svg[\s\S]*<\/svg>$/.test(s.trim())) fail('bad svg'); const f=make('FRAME'); const w=+(s.match(/width="([\d.]+)"/)||[0,100])[1], h=+(s.match(/height="([\d.]+)"/)||[0,100])[1]; f._w=w; f._h=h; currentPage.appendChild(f); return f; },
  combineAsVariants(nodes,parent){ if(!nodes.length) fail('no variants'); const par=nodes[0].parent; for(const n of nodes){ if(n.type!=='COMPONENT') fail('combineAsVariants needs components'); if(n.parent!==par) fail('variants must share a parent'); if(!/^[^=,]+=[^=,]+(, [^=,]+=[^=,]+)*$/.test(n.name)) fail('variant name format: '+n.name); }
    const s=make('COMPONENT_SET'); parent.appendChild(s); for(const n of nodes) s.appendChild(n); return s; },
  createTextStyle(){ const st={id:'S:'+(++id),name:'',_font:null}; Object.defineProperty(st,'fontName',{set(v){ if(!loaded.has(v.family+'|'+v.style)) fail('text style font not loaded'); this._font=v; }, get(){ return this._font; }}); styles[st.id]=st; return st; },
  createImageAsync: async url=>{ if(mode==='noimages') throw new Error('network'); if(!url.startsWith('https://yashcistudy.github.io/')) fail('image outside allowed domain '+url); return {hash:'h'+url.length+url.slice(-8)}; },
  variables:{
    createVariableCollection(name){ const c={name, modes:[{modeId:'m'+(++id),name:'Mode 1'}], renameMode(mid,n){ const m=this.modes.find(m=>m.modeId===mid); if(!m) fail('renameMode bad id'); m.name=n; }, addMode(n){ if(mode==='onemode') throw new Error('Limited to 1 mode'); const m={modeId:'m'+(++id),name:n}; this.modes.push(m); return m.modeId; }}; collections.push(c); return c; },
    createVariable(name,col,type){ if(typeof col==='string') fail('pass the collection node'); if(!['COLOR','FLOAT','STRING','BOOLEAN'].includes(type)) fail('var type'); return {id:'V:'+(++id),name,resolvedType:type,values:{},setValueForMode(mid,v){ if(!col.modes.find(m=>m.modeId===mid)) fail('setValueForMode bad mode for '+name); if(type==='COLOR'&&!(v.type==='VARIABLE_ALIAS'||('r' in v&&'a' in v))) fail('COLOR value must be RGBA or alias'); this.values[mid]=v; }}; },
    createVariableAlias(v){ if(!v||!v.id) fail('alias of nothing'); return {type:'VARIABLE_ALIAS',id:v.id}; },
    setBoundVariableForPaint(p,field,v){ if(field!=='color'||!v||v.resolvedType!=='COLOR') fail('bad bind'); return Object.assign({},p,{boundVariables:{color:{type:'VARIABLE_ALIAS',id:v.id}}}); }
  },
  notify:()=>{}, viewport:{ scrollAndZoomIntoView(){} },
  closePlugin(m){ closed=m||'closed'; }
};
const code=fs.readFileSync(__dirname+'/../plugin/code.js','utf8');
const ctx=vm.createContext({figma, console, setTimeout});
vm.runInContext(code, ctx);
const t0=Date.now();
(function wait(){ if(closed!==null){
  const pages=root.children.map(p=>p.name+' ('+p.findAll(()=>true).length+' nodes)');
  const texts=root.findAll(n=>n.type==='TEXT').length, comps=root.findAll(n=>n.type==='COMPONENT').length, sets=root.findAll(n=>n.type==='COMPONENT_SET').length, insts=root.findAll(n=>n.type==='INSTANCE').length;
  const imgs=root.findAll(n=>n.fills&&n.fills.some&&n.fills.some(f=>f.type==='IMAGE')).length;
  console.log(`[${mode}] closePlugin: ${closed}`); console.log(pages.join('\n')); console.log(`texts ${texts} · components ${comps} in ${sets} sets · instances ${insts} · image frames ${imgs} · text styles ${Object.keys(styles).length} · collections ${collections.map(c=>c.name+' ['+c.modes.map(m=>m.name).join('/')+']').join(', ')}`);
  const warns=[...new Set(log)]; if(warns.length) console.log(warns.slice(0,12).join('\n'), warns.length>12?`\n…${warns.length-12} more`:'');
  const keep=n=>n.type==='COMPONENT'&&(/^(Type=|Size=|State=Closed)/.test(n.name));
  const audit=()=>{ const bad=[]; for(const f of root.findAll(x=>(x.type==='FRAME'||x.type==='COMPONENT')&&x.layoutMode&&x.layoutMode!=='NONE')){ if(keep(f)) continue; const v=f.layoutMode==='VERTICAL'?f.primaryAxisSizingMode:f.counterAxisSizingMode; if(v!=='AUTO') bad.push(f.name); } return bad; };
  const btnW=()=>root.findAll(x=>x.type==='COMPONENT'&&/^(Type=|State=Closed)/.test(x.name)&&x.primaryAxisSizingMode!=='AUTO').map(x=>x.name);
  const b1=audit(); console.log('frames stuck at fixed height:', b1.length, b1.slice(0,6).join(' | ')); console.log('buttons with locked width:', btnW().length);
  const stuckT=root.findAll(n=>n.type==='TEXT'&&n.textAutoResize==='NONE'); console.log('texts stuck at fixed size:', stuckT.length);
  if(process.argv[3]){ // break every frame the way the old builder did, then run the tidy plugin
    for(const f of root.findAll(x=>x.layoutMode&&x.layoutMode!=='NONE')){ f.primaryAxisSizingMode='FIXED'; f.counterAxisSizingMode='FIXED'; }
    for(const t of root.findAll(x=>x.type==='TEXT')) t.textAutoResize='NONE';
    closed=null; const tidy=fs.readFileSync(process.argv[3],'utf8'); vm.runInContext(tidy, ctx);
    const t1=Date.now(); (function w2(){ if(closed!==null){ console.log('[tidy] '+closed); console.log('after tidy, frames stuck:', audit().length, '· buttons with locked width:', btnW().length, '· texts stuck:', root.findAll(n=>n.type==='TEXT'&&n.textAutoResize==='NONE').length); const sets=root.findAll(n=>n.type==='COMPONENT_SET'); console.log('variant sets narrower than their widest variant:', sets.filter(s=>s.width<Math.max(...s.children.map(c=>c.width))+64).length); return; } if(Date.now()-t1>20000){ console.log('tidy TIMEOUT'); return; } setTimeout(w2,50); })(); }
  return; }
  if(Date.now()-t0>20000){ console.log('TIMEOUT, not closed'); return; } setTimeout(wait,50); })();
