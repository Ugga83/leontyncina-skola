# Final variant: each sound once, natural length (no stretching). Sources: see README.md
import subprocess
from build2 import load, frames, classes, longest, dur, OUT
def single(name, src, chars):
  x=load(src); cls=classes(frames(x)); a,b=longest(cls, chars)
  t0=max(0,a*240/24000-0.01); t1=b*240/24000+600/24000; d=t1-t0
  af=f"atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d-0.05:.3f}:d=0.05,adelay=120,apad=pad_dur=0.15"
  subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-b:a','64k',OUT+name+'.mp3'],check=True)
for n,src,ch in [('s','s_0.mp3','F'),('sh','sh_0.mp3','F'),('z','w9.mp3','ZF'),('zh','x3.mp3','ZF'),('c','c_2.mp3','ZF'),('ch','ch_2.mp3','ZF')]:
  single(n,src,ch)
