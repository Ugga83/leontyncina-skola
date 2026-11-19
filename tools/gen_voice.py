#!/usr/bin/env python3
"""Pre-records every sentence of the app with a Czech neural voice.

Reads  app/src/main/assets/www/voice/phrases.json  (made by tools/collect_phrases.js)
Writes app/src/main/assets/www/voice/<key>.mp3 and voice/index.js (list of available keys).
Existing mp3 files are kept, so only new sentences are recorded.
Usage: pip install edge-tts && python tools/gen_voice.py
"""
import asyncio, json, os, shutil, sys

import edge_tts

VOICE = os.environ.get("VOICE", "cs-CZ-VlastaNeural")
RATE = os.environ.get("RATE", "-8%")
WWW = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "assets", "www", "voice")


def fnv(text):
    h = 0x811C9DC5
    for x in text.strip().encode("utf-8"):
        h ^= x
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


async def record(sem, text, key, stats):
    path = os.path.join(WWW, key + ".mp3")
    fixed = os.path.join(WWW, "fixed", key + ".mp3")
    if os.path.exists(fixed):  # hand-made recording (e.g. syllables the voice would spell out)
        shutil.copyfile(fixed, path)
        return
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    async with sem:
        for attempt in range(4):
            try:
                tmp = path + ".part"
                await edge_tts.Communicate(text, VOICE, rate=RATE).save(tmp)
                if os.path.getsize(tmp) > 0:
                    os.replace(tmp, path)
                    stats["new"] += 1
                    return
            except Exception as e:  # network hiccup: retry
                print("retry", key, e, file=sys.stderr)
            await asyncio.sleep(2 + attempt * 3)
        stats["fail"] += 1


async def main():
    phrases = json.load(open(os.path.join(WWW, "phrases.json"), encoding="utf-8"))
    for p in phrases:
        assert fnv(p["t"]) == p["k"], p
    stats = {"new": 0, "fail": 0}
    sem = asyncio.Semaphore(6)
    await asyncio.gather(*(record(sem, p["t"], p["k"], stats) for p in phrases))
    keys = sorted(p["k"] for p in phrases if os.path.exists(os.path.join(WWW, p["k"] + ".mp3")))
    with open(os.path.join(WWW, "index.js"), "w") as f:
        f.write("window.VOICE_INDEX=" + json.dumps(keys) + ";\n")
    print(f"{len(keys)}/{len(phrases)} sentences recorded ({stats['new']} new, {stats['fail']} failed)")


asyncio.run(main())
