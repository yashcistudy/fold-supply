import json, sys, re, os
HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.dirname(HERE); ROOT=os.path.dirname(SRC)
src=open(os.path.join(SRC,'base-scene.html')).read().split('\n')
mat_to_clips='\n'.join(src[291:462])
pdata='\n'.join(src[462:501])
# new cable route: connector by the stand -> through the clips -> off the left edge
old_base=[l for l in mat_to_clips.split('\n') if l.startswith('const BASE=')][0]
new_base="const BASE=[[40,5.4,126],[0,5.4,124],[-60,5.4,120],[-150,5.6,112],[-198,7.6,107],[-228,8.4,107],[-268,8.4,107],[-302,7.4,107],[-335,5.4,100],[-352,4,88],[-372,2.4,70],[-392,2.4,20],[-395,2.4,-80],[-385,2.4,-200],[-380,2.4,-280],[-380,0,-299],[-381,-40,-305],[-382,-400,-308]];"
mat_to_clips=mat_to_clips.replace(old_base,new_base)
mat_to_clips=mat_to_clips.replace("return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35),900,2.4,12,false);","return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35),500,2.4,12,false);")
assert 'const BASE=[[40' in mat_to_clips
old_seg="  tv.set(0,B[1]-A[1],-(B[0]-A[0])).normalize(); m.quaternion.setFromUnitVectors(ZAX,tv);"
assert old_seg in mat_to_clips
mat_to_clips=mat_to_clips.replace(old_seg,"  tv.set(0,B[1]-A[1],-(B[0]-A[0])).normalize(); _yv.crossVectors(tv,_xv); _m4.makeBasis(_xv,_yv,tv); m.quaternion.setFromRotationMatrix(_m4); // keep each part's local +y facing up")
mat_to_clips=mat_to_clips.replace("const ZAX=new THREE.Vector3(0,0,1), tv=new THREE.Vector3();","const ZAX=new THREE.Vector3(0,0,1), tv=new THREE.Vector3(), _xv=new THREE.Vector3(-1,0,0), _yv=new THREE.Vector3(), _m4=new THREE.Matrix4();")
mat_to_clips=mat_to_clips.replace("bumpMap:tex('felt-bump.jpg',7,3.5,true),bumpScale:1.2,","normalMap:tex('felt-normal.jpg',7,3.5,true),normalScale:new THREE.Vector2(.9,.9),roughnessMap:tex('felt-rough.jpg',7,3.5,true),")
mat_to_clips=mat_to_clips.replace("feltMat.color.setScalar(1.3); feltEdgeMat.color.setScalar(1.3);","feltMat.color.setScalar(1.55); feltEdgeMat.color.setScalar(1.55);")
pdata=pdata.replace("limits:'Check that your laptop’s underside sits on both silicone pads before you buy.","limits:'The laptop in the scene is there for scale and isn’t included. Check that your laptop’s underside sits on both silicone pads before you buy.")
cal=json.load(open(os.path.join(HERE,'cal.json')))
a=open(os.path.join(SRC,'parts','a.js')).read().replace('__CAL__',json.dumps(cal))
b=open(os.path.join(SRC,'parts','b.js')).read().replace("stand.add(laptop);","stand.add(laptop);\ncsHidden.push(matTop,matBot,matEdge);")
c=open(os.path.join(SRC,'parts','c.js')).read().replace("  mode='product'; hover=null; transTarget=1;","  mode='product'; hover=null; transTarget=1;\n  if(trans<.01) Object.assign(orbit,productOrbitTarget());")
out=open(os.path.join(SRC,'parts','head.html')).read()+a+'\n'+mat_to_clips+'\n'+pdata+'\n'+b+'\n'+(lambda c,d:c[:c.rindex('</script>')]+d+'\n'+c[c.rindex('</script>'):])(c,(lambda d,e:d[:d.rindex('})();')]+e+'\n'+d[d.rindex('})();'):])(open(os.path.join(SRC,'parts','d.js')).read(),open(os.path.join(SRC,'parts','e.js')).read()))
open(os.path.join(ROOT,'index.html'),'w').write(out)
print('built', len(out))
