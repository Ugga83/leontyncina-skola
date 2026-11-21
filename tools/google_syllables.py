#!/usr/bin/env python3
"""Records every syllable of the app (2-letter phrases in voice/phrases.json) with Google
Text-to-Speech (cs-CZ-Wavenet-A, picked by listening) using an exact IPA pronunciation, into voice/fixed/<key>.mp3.
The neural voice used for sentences spells some syllables out ("so" -> "es o"), so syllables
are made here. Usage:  GOOGLE_TTS_KEY=... python tools/google_syllables.py   (needs ffmpeg)
"""
import base64, json, os, re, subprocess, urllib.request

KEY = os.environ["GOOGLE_TTS_KEY"]
WWW = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "assets", "www", "voice")
C = {'m': 'm', 'l': 'l', 'p': 'p', 's': 's', 'z': 'z', 'c': 't͡s', 'š': 'ʃ', 'ž': 'ʒ', 'č': 't͡ʃ'}
V = {'a': 'a', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɔ', 'u': 'u', 'á': 'aː', 'é': 'ɛː', 'í': 'iː', 'ó': 'ɔː',
     'ú': 'uː', 'ů': 'uː', 'y': 'ɪ', 'ý': 'iː'}


def synth(ssml, out, rate=0.8):
    body = {'input': {'ssml': ssml}, 'voice': {'languageCode': 'cs-CZ', 'name': 'cs-CZ-Wavenet-A'},
            'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': rate, 'sampleRateHertz': 24000}}
    req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize',
                                 data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY})
    open(out, 'wb').write(base64.b64decode(json.load(urllib.request.urlopen(req))['audioContent']))


phrases = json.load(open(os.path.join(WWW, 'phrases.json'), encoding='utf-8'))
fixed = os.path.join(WWW, 'fixed')
os.makedirs(fixed, exist_ok=True)
for p in phrases:
    s = p['t']
    if re.fullmatch(r'[aeiou]', s):                     # a short vowel alone
        ipa = V[s]
    elif re.fullmatch(r'[mlpszcšžč][aeiouáéíóúůyý]', s) and s[0] in C:
        ipa = C[s[0]] + V[s[1]]
    else:
        continue
    # a long vowel (má, sů): normal tempo, then the recording is stretched (variant C, picked by listening),
    # so it really sounds long and not like ma, su – and pí does not turn into "tý" as when spoken slowly
    long = 'ː' in ipa
    synth(f'<speak><phoneme alphabet="ipa" ph="{ipa}">{s}</phoneme></speak>', '/tmp/syl.mp3', 0.8)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/syl.mp3', '-af',
                    ('atempo=0.7,' if long else '') + 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-17:TP=-1.5:LRA=7,aresample=24000,adelay=60,apad=pad_dur=0.15',
                    '-ac', '1', '-b:a', '48k', os.path.join(fixed, p['k'] + '.mp3')], check=True)
    print(s)
