import subprocess, re
from seg import load, frames, classes
OUT='/home/user/Matematika-/app/src/main/assets/www/sounds/'
def dur(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
def longest(cls, chars):
  best=(0,0)
  for m in re.finditer(f'[{chars}]+', cls):
    if m.end()-m.start()>best[1]-best[0]: best=(m.start(),m.end())
  return best
def triple(name, src, chars, gap=0.38):
  x=load(src); cls=classes(frames(x)); a,b=longest(cls, chars)
  t0=max(0,a*240/24000-0.01); t1=b*240/24000+600/24000
  d=t1-t0
  one=f"atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d-0.05:.3f}:d=0.05,apad=pad_dur={gap}"
  fc=f"[0:a]{one},asplit=3[a][b][c];[a][b][c]concat=n=3:v=0:a=1,adelay=120,apad=pad_dur=0.1[o]"
  subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-filter_complex',fc,'-map','[o]','-ac','1','-b:a','64k',OUT+name+'.mp3'],check=True)
  print(name, src, f'{d:.2f}s x3', cls[a:b], '->', round(dur(OUT+name+'.mp3'),2))
triple('s','s_0.mp3','F')
triple('sh','sh_0.mp3','F')
triple('z','w9.mp3','ZF')
triple('zh','x3.mp3','ZF')
