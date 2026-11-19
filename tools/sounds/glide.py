import numpy as np, re
from seg import load, frames, classes
sr=24000
def vowel_glide(f):
  x=load(f); n=600;h=240
  rows=[]
  for i in range(0,len(x)-n,h):
    w=x[i:i+n]*np.hanning(n); sp=np.abs(np.fft.rfft(w))**2; fq=np.fft.rfftfreq(n,1/sr); tot=sp.sum()+1e-12
    band=(fq>250)&(fq<3500)
    rows.append((np.sqrt(np.mean(w**2)), sp[fq>3000].sum()/tot, (fq[band]*sp[band]).sum()/(sp[band].sum()+1e-12), sp[(fq>250)&(fq<1200)].sum()/tot))
  r=np.array(rows); m=r[:,0].max()
  act=np.where(r[:,0]>0.08*m)[0]; a0=act[0]
  # vowel frames: loud, low hi-ratio, after the initial consonant
  vf=[i for i in range(a0,len(r)) if r[i,0]>0.15*m and r[i,1]<0.15]
  if len(vf)<4: return None
  # first contiguous vowel run
  run=[vf[0]]
  for i in vf[1:]:
    if i==run[-1]+1: run.append(i)
    else: break
  if len(run)<4: return dict(len=len(run)*10)
  k=max(2,len(run)//4)
  c0=r[run[:k],2].mean(); c1=r[run[-k:],2].mean()
  pre = r[a0:run[0],1].mean() if run[0]>a0 else 0   # consonant before vowel: hi ratio
  return dict(len=len(run)*10, c0=int(c0), c1=int(c1), glide=int(c1-c0), pre=round(float(pre),2), cons_ms=(run[0]-a0)*10)
if __name__=='__main__':
  import sys
  for f in sys.argv[1:]: print(f, vowel_glide(f))
