# Učíme se s Ayrou – poznámky pro pokračování práce

Android aplikace (WebView) pro prvňačku **Leontýnku**: matematika, čtení, psaní, logopedie (v Přehledu pro rodiče),
hra Ze všeho a odměny. Provází ji samojed **Ayra** (čte se „Ajra“), mluví česky. Komunikace s rodičem je **česky**.

## Domluvená pravidla (dodržovat!)
- **Novou verzi vydávat JEN když rodič napíše „vydej“.** Číslo verze se mění až při vydání.
  Vydání: spustit workflow `android.yml` (workflow_dispatch) na větvi s prací; vytvoří release `v1.0.N` na GitHubu
  (repo `Ugga83/leontyncina-skola`, dřív `Ugga83/Matematika-`). Aplikace si aktualizaci najde sama při spuštění.
- Veškerá práce do v1.0.57 je sloučená v `main`; v1.0.58 je na větvi `cteni-t` (zatím nesloučená). Nová konverzace pracuje na větvi, kterou dostane – workflow běží z libovolné větve.
- Nevytvářet pull requesty, pokud o to rodič nepožádá.
- Klíče jsou jen v GitHub secrets (`SPEECH_API_KEY` = rozpoznávání řeči, vkládá se do aplikace; `GOOGLE_TTS_KEY` = namlouvání,
  jen pro workflow). Nikdy nežádat o vložení klíče do chatu, nic nedávat do repa.
- Oslovení jen „Leontýnko“, ženský rod. Bez nuly v matematice. Psací písmo = font Slabikář.
- Po každé změně: otestovat v Playwrightu (Chromium je předinstalovaný, `file://…/www/index.html`, zařízení Pixel 7),
  poslat rodiči snímek, commit + push. Vydat až na „vydej“.

## Struktura
- `app/src/main/assets/www/` – celá aplikace (HTML/JS/CSS):
  - `index.html` – jádro: hlas (`speak`), Matematika (`drawMath`, `genTask`), konec kola (`finishRound`, `awardRound`),
    navigace (`go`, `PARENT`), `window.App` = sdílené API.
  - `read.js` – Čtení (lekce/dny z úkolů ze školy `R_LESSONS`, čtení s mikrofonem, hra Najdi slabiku, Opakování chyb),
    `A.stt` (rozpoznání), `A.syllables()`.
  - `write.js` – Psaní (obtahování; tiskací písmo Nunito, psací Slabikář), potlačení dlaně, `A.write.traceOne` pro Ze všeho.
  - `endless.js` – hra **Ze všeho** (3 srdíčka, matematika jako v Matematice, najdi slabiku, přečti slabiku, psaní;
    odměny 10/20/30/40 pohár/50/60/75 medaile/100 koruna; ukládání rozehrané hry).
  - `rewards.js` – Ayřina bouda (nábytek, předměty, den/noc, triky, návštěvy kamarádů), cesta, tlapky + kolo štěstí,
    album sbírek (12×10), odznaky (5 stupňů), adventní kalendář, ozdoby na Ayře (`NECK`/`HEAD` SVG).
  - `progress.js` – sledování chyb/opakování, výzva dne, Přehled pro rodiče (podržet nadpis 2 s), logopedie tam.
  - `logo.js` – logopedie. `logo.css` – styly.
  - `voice/` – nahrávky: `phrases.json` (generuje `node tools/collect_phrases.js`), mp3 podle FNV-1a klíče,
    `voice/fixed/` slabiky a krátké samohlásky (hlas cs-CZ-Wavenet-A s IPA, dlouhé natažené atempo 0.7).
- `app/src/main/java/cz/matematika/sovicka/` – MainActivity (WebView, TTS most), CloudSpeech (Google STT), Updater.
- Workflows: `android.yml` (build + release), `voice.yml` (při změně phrases.json namluví nové věty hlasem
  Chirp3-HD-Sulafat a commitne), `syllables.yml` (při změně `tools/google_syllables.py` přenamluví slabiky),
  `voice_samples.yml` (ukázky hlasu k poslechu).
- Nové věty, které Ayra říká, se musí dostat do `phrases.json` (spustit `node tools/collect_phrases.js` před commitem).

## Stav k poslední verzi (v1.0.58)
Hotové vše výše. v1.0.58: úkol „Slabiky s T“ (23.–25. 11.) – poprvé i celá slova (dny „… – slova“,
Ayra říká „slovo“, rozpoznání chce téměř celé slovo, do hry Ze všeho jdou jen slabiky); slabiky s T v `google_syllables.py`. Otevřené / k ověření s rodičem: rozpoznávání slabik i slov na skutečném telefonu (karta „Co Ayra slyšela“
v Přehledu pro rodiče), zda jde dobře obtahovat tiskací písmo, adventní kalendář od 1. 12.
