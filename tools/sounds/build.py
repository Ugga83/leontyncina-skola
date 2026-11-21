import subprocess, re, numpy as np
from seg import load, frames, classes
OUT='/home/user/Matematika-/app/src/main/assets/www/sounds/'
def dur(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
def longest(cls, chars):
  best=(0,0)
  for m in re.finditer(f'[{chars}]+', cls):
    if m.end()-m.start()>best[1]-best[0]: best=(m.start(),m.end())
  return best
def fric(name, src, chars, target=1.4):
  x=load(src); r=frames(x); cls=classes(r)
  a,b=longest(cls, chars)
  t0=a*240/24000+0.005; t1=b*240/24000+600/24000-0.01
  d=t1-t0; f=d/target; chain=[]
  while f<0.5: chain.append('atempo=0.5'); f/=0.5
  chain.append(f'atempo={f:.4f}')
  af=f"atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,{','.join(chain)},afade=t=in:d=0.06,afade=t=out:st={target-0.25:.2f}:d=0.25,adelay=120,apad=pad_dur=0.15"
  subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-b:a','64k',OUT+name+'.mp3'],check=True)
  print(name, src, f'{t0:.2f}-{t1:.2f}', cls[a:b], '->', round(dur(OUT+name+'.mp3'),2))
def aff(name, src):
  af="silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,adelay=120,apad=pad_dur=0.15"
  subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-b:a','64k',OUT+name+'.mp3'],check=True)
  print(name, src, '->', round(dur(OUT+name+'.mp3'),2))
fric('s','s_0.mp3','F')
fric('sh','sh_0.mp3','F')
fric('z','w9.mp3','ZF')
fric('zh','x3.mp3','ZF')
aff('c','c_0.mp3'); aff('ch','ch_0.mp3')
