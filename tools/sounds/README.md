# Ukázky samotných hlásek (app/src/main/assets/www/sounds/*.mp3)

Hlas Vlasta (edge-tts) samotnou hlásku neumí protáhnout, proto:
1. vygenerujeme krátké zdroje (`edge-tts --voice cs-CZ-VlastaNeural --rate=-8%`):
   - S: text `s`, Š: text `š` (obsahuje „e“ – vyřízne se jen šum)
   - Z: začátek slova `zuby`, Ž: začátek slova `želva` (samotné z/ž čte hlas nezněle)
   - C: text `c`, Č: text `č`
2. Natahování znělo roboticky, proto se hlásky nenatahují:
   - S: text `S! S! S!` použitý celý (stejně jako C a Č)
   - Š, Z, Ž: `build2.py` (s `seg.py`) vyřízne přirozený úsek hlásky bez samohlásky a zopakuje ho 3×.
   (`build.py` = starší varianta s natažením, nepoužívá se.)
Zdrojové soubory čte z aktuálního adresáře (s_0.mp3, sh_0.mp3, w9.mp3, x3.mp3, c_0.mp3, ch_0.mp3).

Aktuálně: každá hláska zazní jen jednou, v přirozené délce – `build_single.py`.
