import cv2, numpy as np, json, sys
# image corners (px) of the desktop: RL, RR, FR, FL
pts=json.loads(sys.argv[1]) if len(sys.argv)>1 else [[376,648],[2648,648],[3016,1416],[42,1416]]
W,H=3072,2048
obj=np.array([[-600,0,-300],[600,0,-300],[600,0,300],[-600,0,300]],np.float64)
img=np.array(pts,np.float64)
best=None
for f in np.linspace(1200,6000,961):
    K=np.array([[f,0,W/2],[0,f,H/2],[0,0,1]])
    ok,r,t=cv2.solvePnP(obj,img,K,None,flags=cv2.SOLVEPNP_IPPE)
    pr,_=cv2.projectPoints(obj,r,t,K,None); e=np.abs(pr.reshape(-1,2)-img).max()
    if best is None or e<best[0]: best=(e,f,r,t)
e,f,r,t=best
R,_=cv2.Rodrigues(r); C=(-R.T@t).ravel()
# three.js basis: X=right=R[0], Y=up=-R[1], Z=back=-R[2]
M=np.stack([R[0],-R[1],-R[2]],1)
q=cv2.RQDecomp3x3(M)  # not used; compute quaternion directly
def quat(m):
    tr=m[0,0]+m[1,1]+m[2,2]
    if tr>0:
        s=0.5/np.sqrt(tr+1); return [(m[2,1]-m[1,2])*s,(m[0,2]-m[2,0])*s,(m[1,0]-m[0,1])*s,0.25/s]
    i=np.argmax([m[0,0],m[1,1],m[2,2]])
    if i==0:
        s=2*np.sqrt(1+m[0,0]-m[1,1]-m[2,2]); return [0.25*s,(m[0,1]+m[1,0])/s,(m[0,2]+m[2,0])/s,(m[2,1]-m[1,2])/s]
    if i==1:
        s=2*np.sqrt(1+m[1,1]-m[0,0]-m[2,2]); return [(m[0,1]+m[1,0])/s,0.25*s,(m[1,2]+m[2,1])/s,(m[0,2]-m[2,0])/s]
    s=2*np.sqrt(1+m[2,2]-m[0,0]-m[1,1]); return [(m[0,2]+m[2,0])/s,(m[1,2]+m[2,1])/s,0.25*s,(m[1,0]-m[0,1])/s]
fov=2*np.degrees(np.arctan(H/2/f))
pitch=np.degrees(np.arcsin(-R[2][1]))
out={'W':W,'H':H,'fov':round(float(fov),4),'pos':[round(float(x),2) for x in C],'quat':[float(x) for x in quat(M)],'f':float(f),'err':float(e),'pitch':float(pitch)}
print(json.dumps(out))
