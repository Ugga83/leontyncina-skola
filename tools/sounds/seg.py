import subprocess, numpy as np, sys
sr=24000
def load(f):
  raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','24000','-f','f32le','-'],capture_output=True).stdout
  return np.frombuffer(raw,dtype=np.float32)
def frames(x):
  n=600;h=240; rows=[]
  for i in range(0,len(x)-n,h):
    w=x[i:i+n]*np.hanning(n); rms=np.sqrt(np.mean(w**2))
    sp=np.abs(np.fft.rfft(w))**2; fq=np.fft.rfftfreq(n,1/sr); tot=sp.sum()+1e-12
    rows.append((i/sr,rms,sp[(fq>300)&(fq<1500)].sum()/tot,sp[fq>2000].sum()/tot,sp[fq<300].sum()/tot))
  return np.array(rows)
def classes(r):
  m=r[:,1].max(); out=[]
  for t,rms,lo,hi,vb in r:
    if rms<=0.05*m: out.append('.')
    elif lo>0.3 and hi<0.2: out.append('V')
    elif hi>0.3 and vb>0.02: out.append('Z')
    elif hi>0.5: out.append('F')
    else: out.append('.')
  return ''.join(out)
if __name__=='__main__':
  for f in sys.argv[1:]: print(f"{f:8s}", classes(frames(load(f+'.mp3'))))
