<script type="module">
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SNAP = new URLSearchParams(location.search).has('snap'); // test hook: settle instantly
const $ = s => document.querySelector(s);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ramp=(p,a,b)=>clamp((p-a)/(b-a),0,1);
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const sstep=(a,b,t)=>{ t=ramp(t,a,b); return t*t*(3-2*t); };
const D2R=Math.PI/180;
const mobile=()=>innerWidth<=760;

/* Camera solved from the four desktop corners of plate P1 (desk units: mm, origin = centre of desktop, y up, z towards the camera) */
const CAL = __CAL__;

/* =========================================================
   Renderer, scene, light
   ========================================================= */
const canvas=$('#gl');
let renderer;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ $('#loader').style.display='none'; $('#fallback').style.display='flex'; throw e; }
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.VSMShadowMap;
renderer.setClearColor(0x000000,0);
renderer.autoClear=false;
THREE.Cache.enabled=true;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(CAL.fov,1,8,30000);
scene.add(camera);
const pmrem=new THREE.PMREMGenerator(renderer);

const manager=new THREE.LoadingManager();
manager.onProgress=(u,l,t)=>{$('#loadBar').style.transform=`scaleX(${l/t})`;};
const tl=new THREE.TextureLoader(manager);
const maxAniso=renderer.capabilities.getMaxAnisotropy();
function tex(name,rx,ry,linear){
  const t=tl.load('assets/tex/'+name);
  t.colorSpace=linear?THREE.NoColorSpace:THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=Math.min(8,maxAniso);
  return t;
}
/* captured interior light (CC0 HDRI), shipped as two lossless PNGs: RGB mantissa + exponent (RGBE) */
(function loadEnv(){
  manager.itemStart('env');
  const load=src=>new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  Promise.all([load('assets/env/room-rgb.png'),load('assets/env/room-e.png')]).then(([a,b])=>{
    const w=a.width,h=a.height, c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(a,0,0); const A=g.getImageData(0,0,w,h).data; g.clearRect(0,0,w,h); g.drawImage(b,0,0); const B=g.getImageData(0,0,w,h).data;
    const out=new Uint16Array(w*h*4), H=v=>THREE.DataUtils.toHalfFloat(Math.min(v,65000)), one=H(1);
    for(let i=0;i<w*h;i++){ const e=B[4*i]; const s=e?Math.pow(2,e-136):0;
      out[4*i]=H((A[4*i]+.5)*s); out[4*i+1]=H((A[4*i+1]+.5)*s); out[4*i+2]=H((A[4*i+2]+.5)*s); out[4*i+3]=one; }
    const t=new THREE.DataTexture(out,w,h,THREE.RGBAFormat,THREE.HalfFloatType);
    t.colorSpace=THREE.LinearSRGBColorSpace; t.mapping=THREE.EquirectangularReflectionMapping; t.magFilter=t.minFilter=THREE.LinearFilter; t.needsUpdate=true;
    scene.environment=pmrem.fromEquirectangular(t).texture; t.dispose(); window.__env='ok';
  }).catch(e=>{ window.__env='fail'; console.error('environment failed',e); }).finally(()=>manager.itemEnd('env'));
})();

/* key light: the window on the right; evening: the desk lamp at the back left */
const key=new THREE.DirectionalLight(0xfff4e8,1.5);
key.position.set(CAL.light[0],CAL.light[1],CAL.light[2]);
key.castShadow=true;
key.shadow.mapSize.set(mobile()?1024:2048,mobile()?1024:2048);
Object.assign(key.shadow.camera,{left:-700,right:700,top:700,bottom:-700,near:100,far:8000});
key.shadow.radius=14; key.shadow.blurSamples=16; key.shadow.bias=-0.0006;
scene.add(key); scene.add(key.target);
const lamp=new THREE.PointLight(0xffa457,0,0,2);
lamp.position.set(CAL.lamp[0],CAL.lamp[1],CAL.lamp[2]);
scene.add(lamp);

/* =========================================================
   The photographed room: a plate glued to the camera frustum
   ========================================================= */
const plateTex={day:tl.load('assets/plates/day.webp'),eve:tl.load('assets/plates/eve.webp')};
for(const k in plateTex){ plateTex[k].colorSpace=THREE.NoColorSpace; plateTex[k].generateMipmaps=false; plateTex[k].minFilter=THREE.LinearFilter; }
const plateMat=new THREE.ShaderMaterial({
  uniforms:{tDay:{value:plateTex.day},tEve:{value:plateTex.eve},mixE:{value:0},opacity:{value:1}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform sampler2D tDay,tEve; uniform float mixE,opacity; varying vec2 vUv; void main(){ vec3 a=texture2D(tDay,vUv).rgb, b=texture2D(tEve,vUv).rgb; gl_FragColor=vec4(mix(a,b,mixE),opacity); }',
  depthTest:false,depthWrite:false,transparent:true,toneMapped:false
});
const PLATE_D=20000;
const plateH=2*PLATE_D*Math.tan(CAL.fov*D2R/2), plateW=plateH*CAL.W/CAL.H;
const plate=new THREE.Mesh(new THREE.PlaneGeometry(plateW,plateH),plateMat);
plate.renderOrder=-1000; plate.frustumCulled=false;
const bgScene=new THREE.Scene(); bgScene.add(plate); // drawn first, in its own pass
const _fw=new THREE.Vector3();
function syncPlate(){ camera.getWorldDirection(_fw); plate.position.copy(camera.position).addScaledVector(_fw,PLATE_D); plate.quaternion.copy(camera.quaternion); }

/* shadow catcher on the photographed desktop */
const catcherMat=new THREE.ShadowMaterial({opacity:.34,transparent:true});
const catcher=new THREE.Mesh(new THREE.PlaneGeometry(1200,600),catcherMat);
catcher.rotation.x=-Math.PI/2; catcher.position.y=.05; catcher.receiveShadow=true; scene.add(catcher);

/* the photographed desk as an invisible depth mask, so anything below the desktop stays hidden */
const occluder=new THREE.Mesh(new THREE.BoxGeometry(1200,740,600),new THREE.MeshBasicMaterial({colorWrite:false}));
occluder.position.y=-370.2; occluder.renderOrder=-500; scene.add(occluder);

/* a real 3D desk, only seen once the camera leaves the photo (product pages) */
const deskMat=new THREE.MeshStandardMaterial({map:tex('oak.jpg',2,1),bumpMap:tex('oak-bump.jpg',2,1,true),bumpScale:.35,roughness:.58,envMapIntensity:.6,transparent:true,opacity:0});
const desk3d=new THREE.Mesh(new RoundedBoxGeometry(1200,24,600,2,2),deskMat);
desk3d.position.y=-12.05; desk3d.receiveShadow=true; desk3d.visible=false; scene.add(desk3d);

const PICK=[];
function mk(geo,mat,prod){ const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; if(prod){m.userData.prod=prod; PICK.push(m);} return m; }

/* =========================================================
   Contact shadows: depth seen from under the products, blurred
   ========================================================= */
const CS={w:1300,d:700,res:mobile()?256:512,far:70,y:3.15};
const csRT=new THREE.WebGLRenderTarget(CS.res,Math.round(CS.res*CS.d/CS.w)); csRT.texture.generateMipmaps=false;
const csRT2=new THREE.WebGLRenderTarget(CS.res,Math.round(CS.res*CS.d/CS.w)); csRT2.texture.generateMipmaps=false;
const csCam=new THREE.OrthographicCamera(-CS.w/2,CS.w/2,CS.d/2,-CS.d/2,0,CS.far);
csCam.rotation.x=Math.PI/2; csCam.position.y=CS.y; scene.add(csCam);
const csDepth=new THREE.MeshDepthMaterial(); csDepth.depthTest=false; csDepth.depthWrite=false;
csDepth.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );','gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * 1.6 );'); };
const csPlaneMat=new THREE.MeshBasicMaterial({map:csRT.texture,transparent:true,opacity:.62,depthWrite:false,toneMapped:false});
const csPlane=new THREE.Mesh(new THREE.PlaneGeometry(CS.w,CS.d).rotateX(Math.PI/2),csPlaneMat);
csPlane.scale.y=-1; csPlane.position.y=CS.y+.15; csPlane.renderOrder=-10; scene.add(csPlane);
const blurCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const hBlur=new THREE.ShaderMaterial(HorizontalBlurShader), vBlur=new THREE.ShaderMaterial(VerticalBlurShader);
hBlur.depthTest=vBlur.depthTest=false;
const blurQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),hBlur); const blurScene=new THREE.Scene(); blurScene.add(blurQuad);
const csHidden=[];
function renderContact(){
  const hide=[plate,catcher,csPlane,desk3d,occluder,...csHidden], was=hide.map(o=>o.visible);
  hide.forEach(o=>o.visible=false);
  scene.overrideMaterial=csDepth;
  renderer.setRenderTarget(csRT); renderer.setClearColor(0x000000,0); renderer.clear(); renderer.render(scene,csCam);
  scene.overrideMaterial=null;
  hide.forEach((o,i)=>o.visible=was[i]);
  for(let i=0;i<2;i++){
    blurQuad.material=hBlur; hBlur.uniforms.tDiffuse.value=csRT.texture; hBlur.uniforms.h.value=(i?2.2:3.2)/256;
    renderer.setRenderTarget(csRT2); renderer.clear(); renderer.render(blurScene,blurCam);
    blurQuad.material=vBlur; vBlur.uniforms.tDiffuse.value=csRT2.texture; vBlur.uniforms.v.value=(i?2.2:3.2)/256;
    renderer.setRenderTarget(csRT); renderer.clear(); renderer.render(blurScene,blurCam);
  }
  renderer.setRenderTarget(null);
}
