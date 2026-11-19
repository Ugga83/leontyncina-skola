import numpy as np, subprocess, re
from seg import load, frames, classes
sr=24000
def cut_first(src, out, kind):
  x=load(src); r=frames(x); cls=classes(r)
  if kind=='fric':   # second fricative run starts the 2nd syllable
    runs=[m.start() for m in re.finditer(r'[ZF]+', cls)]
    end=runs[1]*240/sr - 0.005
  else:              # stop consonant: deepest energy dip between the two vowels
    rms=np.array([np.sqrt(np.mean(x[i:i+240]**2)) for i in range(0,len(x)-240,240)])
    act=np.where(rms>0.08*rms.max())[0]; a0,a1=act[0],act[-1]
    mid=np.arange(a0+5, a1-5); k=mid[np.argmin(rms[mid])]
    end=k*240/sr
  af=f"atrim=0:{end:.3f},silenceremove=start_periods=1:start_threshold=-50dB,afade=t=out:st={max(0,end-0.06):.3f}:d=0.04,adelay=60,apad=pad_dur=0.15"
  subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-ar','24000','-b:a','48k',out],check=True)
for s,src,k in [('so','D_so1.mp3','fric'),('su','D_su1.mp3','fric'),('pi','D_pi1.mp3','stop')]:
  cut_first(src, f'fix_{s}.mp3', k)
