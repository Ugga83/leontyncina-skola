# Učíme se s Ayrou – poznámky pro pokračování práce

Android aplikace (WebView) pro prvňačku **Leontýnku**: matematika, čtení, psaní, logopedie (v Přehledu pro rodiče),
hra Ze všeho a odměny. Provází ji samojed **Ayra** (čte se „Ajra“), mluví česky. Komunikace s rodičem je **česky**.

## Domluvená pravidla (dodržovat!)
- **Novou verzi vydávat JEN když rodič napíše „vydej“.** Číslo verze se mění až při vydání.
  Vydání: spustit workflow `android.yml` (workflow_dispatch) na větvi s prací; vytvoří release `v1.0.N` na GitHubu
  (repo `Ugga83/leontyncina-skola`, dřív `Ugga83/Matematika-`). Aplikace si aktualizaci najde sama při spuštění.
- Veškerá práce do v1.0.57 je sloučená v `main`; v1.0.58–59 jsou na větvi `cteni-t` (zatím nesloučená). Nová konverzace pracuje na větvi, kterou dostane – workflow běží z libovolné větve.
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
  - `read.js` – Čtení (lekce/dny z úkolů ze školy `R_LESSONS`, čtení s rodičem – mikrofon vypnutý, rodič potvrzuje ✓ Správně / ✗ Ještě ne, hra Najdi slabiku, hra „Přečti a ukaž obrázek“ (slova lekce s obrázkem z `WORD_PICS`), Opakování chyb),
    `A.stt` (rozpoznání), `A.syllables()`.
  - `write.js` – Psaní (obtahování; tiskací písmo Nunito, psací Slabikář; psací tvar se nejdřív sám napíše + zelený bod startu, ✏️ = ukázat znovu;
    **Rozcvička ruky** = tvary `PAT` (vlnky, déšť, pila, kolečka, houpačky, kličky, šnek) jako tahy, animace jede po skutečném tahu), potlačení dlaně, `A.write.traceOne` pro Ze všeho.
  - `endless.js` – hra **Ze všeho** (3 srdíčka, matematika jako v Matematice, najdi slabiku (Ayra říká, Leontýnka hádá), psaní – bez mikrofonu;
    odměny 10/20/30/40 pohár/50/60/75 medaile/100 koruna; ukládání rozehrané hry).
  - `rewards.js` – Ayřina bouda (nábytek, předměty, den/noc, triky, návštěvy kamarádů), cesta, tlapky + kolo štěstí,
    album sbírek (12×10), odznaky (5 stupňů), adventní kalendář, ozdoby na Ayře (`NECK`/`HEAD` SVG).
  - `play.js` – **Herna** (Zahrádka, Nakrm kamarády, Ubraň kostičky; hra stojí 1 🐾 – tlapek je tolik, kolik dní procvičovala,
    minus `pawSpent`), **návštěvy na Ayřině cestě** (na každé nové zastávce kamarád se 3 úkoly, `jvisit` = počet pozdravených,
    každá 3. zastávka rozcestí s pokladem), společné úkoly `makeTask` (počítání / najdi slabiku / přečti slovo a ukaž obrázek).
  - `play.js` také **Skládám slova** (v Psaní: Ayra řekne slovo z úkolů ze školy, skládá se z písmenkových kostek).
  - Nastavení rodiče (Pro rodiče): **probraná písmena** (`letters`, `App.allowed()` – filtruje Psaní, Skládání, Hernu, cestu, Ze všeho;
    úkoly ze školy ve Čtení zůstávají celé) a **délka kola** (`rlen` short/normal/long → `App.roundLen()`).
  - `progress.js` – sledování chyb/opakování, výzva dne, Přehled pro rodiče (podržet nadpis 2 s), logopedie tam.
  - `logo.js` – logopedie. `logo.css` – styly.
  - `voice/` – nahrávky: `phrases.json` (generuje `node tools/collect_phrases.js`), mp3 podle FNV-1a klíče,
    `voice/fixed/` slabiky a krátké samohlásky (hlas cs-CZ-Wavenet-A s IPA, dlouhé natažené atempo 0.7).
- `app/src/main/java/cz/matematika/sovicka/` – MainActivity (WebView, TTS most), CloudSpeech (Google STT), Updater.
- Workflows: `android.yml` (build + release), `voice.yml` (při změně phrases.json namluví nové věty hlasem
  Chirp3-HD-Sulafat a commitne), `syllables.yml` (při změně `tools/google_syllables.py` přenamluví slabiky),
  `voice_samples.yml` (ukázky hlasu k poslechu).
- Nové věty, které Ayra říká, se musí dostat do `phrases.json` (spustit `node tools/collect_phrases.js` před commitem).

## Stav k poslední verzi (v1.0.59)
Hotové vše výše. v1.0.58: úkol „Slabiky s T“ (23.–25. 11.) – poprvé i celá slova (dny „… – slova“,
Ayra říká „slovo“, rozpoznání chce téměř celé slovo, do hry Ze všeho jdou jen slabiky); slabiky s T v `google_syllables.py`. v1.0.59: rodič chtěl pryč mikrofon – Čtení jen s potvrzením rodiče, ze hry Ze všeho čtení nahlas úplně pryč;
Psaní uzná písmeno až při pokrytí ≥ 85 % a bez neobtaženého kousku (kontrola po částech).
Potom (nevydáno, podle nápadů z bystrohra.cz): hra „Přečti a ukaž obrázek“ ve Čtení, psací písmo se samo napíše + zelený start,
T v Psaní (t, T, ta–tu, táta, teta, léto, mapa), v Matematice po příkladu s nápovědou přijde o 3 dál podobný „ověřovací“ (max 2 za kolo, bez hvězdy).
Dále (nevydáno, inspirace hrou bystrohra.cz – vlastní provedení s Ayrou): Herna za tlapky, živá cesta s kamarády a rozcestím,
mapa cesty šedá před Ayrou.
Otevřené / k ověření s rodičem: zda je obtahování teď přísné akorát, adventní kalendář od 1. 12.
