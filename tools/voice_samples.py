#!/usr/bin/env python3
"""Makes test recordings of a few syllables in several ways, so a person can listen and pick one.
Output: samples/<way>_<syllable>.mp3   (run by .github/workflows/voice_samples.yml)
  A = now: Wavenet-B with exact IPA (another voice than the sentences)
  B = the sentence voice (Chirp3-HD Sulafat), the syllable alone
  C = the sentence voice, "lo, lo." and the first one cut out
  D = the sentence voice with a custom IPA pronunciation (if Google allows it for this voice)
  E = Wavenet-A (female) with exact IPA
"""
import base64, json, os, subprocess, urllib.request, urllib.error

KEY = os.environ["GOOGLE_TTS_KEY"]
OUT = os.path.join(os.path.dirname(__file__), "..", "samples")
SYL = ["lo", "lu", "mo", "so", "se", "si", "pi", "ža"]
C = {'m': 'm', 'l': 'l', 'p': 'p', 's': 's', 'ž': 'ʒ'}
V = {'a': 'a', 'e': 'ɛ', 'i': 'ɪ', 'o': 'o', 'u': 'u'}
CHIRP = "cs-CZ-Chirp3-HD-Sulafat"


def tts(body):
    req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize",
                                 data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "X-Goog-Api-Key": KEY})
    return base64.b64decode(json.load(urllib.request.urlopen(req, timeout=60))["audioContent"])


def save(name, data):
    raw = os.path.join(OUT, name + ".raw.mp3")
    open(raw, "wb").write(data)
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-17:TP=-1.5:LRA=7,apad=pad_dur=0.15")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-ac", "1", "-b:a", "48k", os.path.join(OUT, name + ".mp3")]
    subprocess.run(cmd, check=True)
    os.remove(raw)


def first_part(name, data):
    """cut "lo, lo." at the first silence"""
    raw = os.path.join(OUT, name + ".raw.mp3"); open(raw, "wb").write(data)
    log = subprocess.run(["ffmpeg", "-i", raw, "-af", "silencedetect=n=-40dB:d=0.1", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(l.split("silence_start: ")[1]) for l in log.splitlines() if "silence_start" in l]
    starts = [s for s in starts if s > 0.15]
    end = starts[0] if starts else 1.0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    f"atrim=0:{end + 0.05},silenceremove=start_periods=1:start_threshold=-45dB,loudnorm=I=-17:TP=-1.5:LRA=7,apad=pad_dur=0.15",
                    "-ac", "1", "-b:a", "48k", os.path.join(OUT, name + ".mp3")], check=True)
    os.remove(raw)


os.makedirs(OUT, exist_ok=True)
# round 3: long vowels made clearly longer (má still sounded short)
def wa(ssml, rate=0.8):
    return tts({"input": {"ssml": ssml}, "voice": {"languageCode": "cs-CZ", "name": "cs-CZ-Wavenet-A"},
                "audioConfig": {"audioEncoding": "MP3", "speakingRate": rate}})
def stretch(src, dst, tempo):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(OUT, src + ".mp3"), "-af", f"atempo={tempo}",
                    "-ac", "1", "-b:a", "48k", os.path.join(OUT, dst + ".mp3")], check=True)
for s, c, v in [("má", "m", "a"), ("pí", "p", "i"), ("sů", "s", "u")]:
    jobs = {
        "a": lambda: save(f"a_{s}", wa(f'<speak><phoneme alphabet="ipa" ph="{c}{v}ːː">{s}</phoneme></speak>')),
        "b": lambda: save(f"b_{s}", wa(f'<speak><phoneme alphabet="ipa" ph="{c}{v}{v}">{s}</phoneme></speak>')),
        "c": lambda: (save(f"t_{s}", wa(f'<speak><phoneme alphabet="ipa" ph="{c}{v}ː">{s}</phoneme></speak>')), stretch(f"t_{s}", f"c_{s}", 0.7)),
        "d": lambda: save(f"d_{s}", wa(f'<speak><prosody rate="x-slow"><phoneme alphabet="ipa" ph="{c}{v}ː">{s}</phoneme></prosody></speak>')),
    }
    for k, f in jobs.items():
        try:
            f(); print("ok", k, s)
        except Exception as e:
            print("fail", k, s, e)
