#!/usr/bin/env python3
"""Pre-records every sentence of the app with a Czech Google voice.

Reads  app/src/main/assets/www/voice/phrases.json  (made by tools/collect_phrases.js)
Writes app/src/main/assets/www/voice/<key>.mp3 and voice/index.js (list of available keys).
Existing mp3 files are kept, so only new sentences are recorded (stays well inside the free tier).
Syllables come from voice/fixed/ (made by tools/google_syllables.py with an exact pronunciation).

Usage:  GOOGLE_TTS_KEY=... python tools/gen_voice.py      (the key is never stored in the repo)
"""
import base64, json, os, shutil, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

VOICE = os.environ.get("VOICE", "cs-CZ-Chirp3-HD-Sulafat")
KEY = os.environ["GOOGLE_TTS_KEY"]
WWW = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "assets", "www", "voice")


def fnv(text):
    h = 0x811C9DC5
    for x in text.strip().encode("utf-8"):
        h ^= x
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def synth(text, out):
    body = {"input": {"text": text}, "voice": {"languageCode": "cs-CZ", "name": VOICE},
            "audioConfig": {"audioEncoding": "MP3", "sampleRateHertz": 24000}}
    req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize",
                                 data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "X-Goog-Api-Key": KEY})
    data = json.load(urllib.request.urlopen(req, timeout=60))
    with open(out, "wb") as f:
        f.write(base64.b64decode(data["audioContent"]))


def record(p):
    text, key = p["t"], p["k"]
    path = os.path.join(WWW, key + ".mp3")
    fixed = os.path.join(WWW, "fixed", key + ".mp3")
    if os.path.exists(fixed):          # hand-made (syllables with exact pronunciation)
        shutil.copyfile(fixed, path)
        return "fixed"
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return "kept"
    for attempt in range(5):
        try:
            synth(text, path + ".part")
            os.replace(path + ".part", path)
            return "new"
        except urllib.error.HTTPError as e:
            print("retry", key, e.code, e.read()[:200], file=sys.stderr)
        except Exception as e:  # network hiccup
            print("retry", key, e, file=sys.stderr)
        time.sleep(2 + attempt * 3)
    return "fail"


def main():
    phrases = json.load(open(os.path.join(WWW, "phrases.json"), encoding="utf-8"))
    for p in phrases:
        assert fnv(p["t"]) == p["k"], p
    with ThreadPoolExecutor(4) as ex:
        res = list(ex.map(record, phrases))
    keys = sorted(p["k"] for p in phrases if os.path.exists(os.path.join(WWW, p["k"] + ".mp3")))
    with open(os.path.join(WWW, "index.js"), "w") as f:
        f.write("window.VOICE_INDEX=" + json.dumps(keys) + ";\n")
    print({k: res.count(k) for k in set(res)}, f"{len(keys)}/{len(phrases)} available")


main()
