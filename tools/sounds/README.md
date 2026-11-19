# Ukázky samotných hlásek (app/src/main/assets/www/sounds/*.mp3)

Hlas Vlasta (edge-tts) samotnou hlásku neumí protáhnout, proto:
1. vygenerujeme krátké zdroje (`edge-tts --voice cs-CZ-VlastaNeural --rate=-8%`):
   - S: text `s`, Š: text `š` (obsahuje „e“ – vyřízne se jen šum)
   - Z: text `Zzzzzzaa`, Ž: text `vžžžžum` (samotné z/ž čte hlas nezněle)
   - C: text `C! C! C!`, Č: text `Č! Č! Č!` (použité celé)
2. `build.py` (s pomocí `seg.py`) najde v nahrávce úsek se šumem bez samohlásky, vyřízne ho
   a natáhne na ~1,4 s (ffmpeg atempo).
Zdrojové soubory čte z aktuálního adresáře (s_0.mp3, sh_0.mp3, w9.mp3, x3.mp3, c_0.mp3, ch_0.mp3).
