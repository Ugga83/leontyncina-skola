# Učíme se s Ayrou – poznámky pro pokračování práce

Android aplikace (WebView) pro prvňačku **Leontýnku**: matematika, čtení, psaní, logopedie (v Přehledu pro rodiče),
hra Ze všeho a odměny. Provází ji samojed **Ayra** (čte se „Ajra“), mluví česky. Komunikace s rodičem je **česky**.

## Domluvená pravidla (dodržovat!)
- **Novou verzi vydávat JEN když rodič napíše „vydej“.** Číslo verze se mění až při vydání.
  Vydání: spustit workflow `android.yml` (workflow_dispatch) na větvi s prací; vytvoří release `v1.0.N` na GitHubu
  (repo `Ugga83/leontyncina-skola`, dřív `Ugga83/Matematika-`). Aplikace si aktualizaci najde sama při spuštění.
- Veškerá práce je sloučená v `main` (k 25. 11. 2026, v1.0.64). Nová konverzace pracuje na větvi, kterou dostane – workflow běží z libovolné větve.
- Nevytvářet pull requesty, pokud o to rodič nepožádá.
- Klíče jsou jen v GitHub secrets (`SPEECH_API_KEY` = rozpoznávání řeči, vkládá se do aplikace; `GOOGLE_TTS_KEY` = namlouvání,
  jen pro workflow). Nikdy nežádat o vložení klíče do chatu, nic nedávat do repa.
- Oslovení jen „Leontýnko“, ženský rod. Bez nuly v matematice. Psací písmo: obtahovací předlohy = tahy podle české školní normy
  (`write_strokes.js`, specifikaci dodal rodič); font Slabikář jen pro popisky.
- Po každé změně: otestovat v Playwrightu (Chromium je předinstalovaný, `file://…/www/index.html`, zařízení Pixel 7),
  poslat rodiči snímek, commit + push. Vydat až na „vydej“.

## Struktura
- `app/src/main/assets/www/` – celá aplikace (HTML/JS/CSS):
  - `index.html` – jádro: hlas (`speak`), Matematika (`drawMath`, `genTask`), konec kola (`finishRound`, `awardRound`),
    navigace (`go`, `PARENT`), `window.App` = sdílené API.
  - `read.js` – Čtení (lekce/dny z úkolů ze školy `R_LESSONS`, čtení s rodičem – mikrofon vypnutý, rodič potvrzuje ✓ Správně / ✗ Ještě ne, hra Najdi slabiku, hra „Přečti a ukaž obrázek“ (slova lekce s obrázkem z `WORD_PICS`), Opakování chyb),
    `A.stt` (rozpoznání), `A.syllables()`.
  - `write.js` – Psaní (obtahování; tiskací písmo Nunito, psací Slabikář; psací tvar se nejdřív sám napíše + zelený bod startu, ✏️ = ukázat znovu;
    **Číslice 0–9** = skutečné tahy `DIGIT` podle české školní normy (rodič dodal pravidla: pásmo Y1–Y3, start, CW/CCW, ZVEDNOUT,
    sklon 75° v psacím, 90° v tiskacím); kreslí se linky Y3/Y2/Y1/Y0, animace jede po tazích, zelený start + šipka + číslo tahu.
    **Písmena, slabiky, slova** = tahy z `write_strokes.js` podle normy od rodiče (Y0–Y3, CW/CCW, ZVEDNOUT): tiskací velká/malá
    (`PR`, zvlášť s mezerou), psací malá (`CUR`: start up/oval/arch, mistička [DOLNÍ], o = [HORNÍ]) a velká (`CAP`, nap = napojuje),
    vázané psaní slov (napojení do oválu od 2 h, nenapojující velké = zvednout), diakritika/tečky/přeškrtnutí až po dopsání slova.
    Celá abeceda a–z, A–Z vč. Ch a diakritiky (háček, čárka, kroužek, zobáček u ď ť); psací tvary podle plakátu „Česká psací
    abeceda“ (rodič poslal obrázek; S = háček dole, strmý dřík, velká smyčka nahoře doleva).
    **Rozcvička ruky** = tvary `PAT` (vlnky, déšť, pila, kolečka, houpačky, kličky, šnek) jako tahy, animace jede po skutečném tahu), potlačení dlaně, `A.write.traceOne` pro Ze všeho.
  - `endless.js` – hra **Ze všeho** (3 srdíčka, matematika jako v Matematice, najdi slabiku (Ayra říká, Leontýnka hádá), psaní – bez mikrofonu;
    odměny 10/20/30/40 pohár/50/60/75 medaile/100 koruna; ukládání rozehrané hry).
  - `ayra.js` – **živá Ayra z původních obrázků**: WebGL mesh warp (síť 56×56) – obrázek se plynule ohýbá: hlava se naklání kolem krku,
    tělo dýchá, oči se při mrknutí smáčknou do čárky, uši stříhají, jazýček oddechuje, ocásek se vrtí; v boudě chůze (`ayra_walk.png`,
    kráčející tlapky) a spánek (`ayra_sleep.png`, dýchání). Souřadnice částí v `KIND`. Obrázky jsou vložené jako data v `ayra_img.js`
    (WebGL nesmí brát obrázky z file://) – po změně PNG spustit `python3 tools/ayra_img.py`. Bez WebGL zůstane statický obrázek.
    **Ozdoby** (`ayra_wear.js`): všech 29 nositelných věcí nakreslených v SVG ve stylu Ayry, vkreslují se PŘÍMO do textury
    (kotvy head/eyes/neck pro full/walk/sleep, `s` = velikost), takže se hýbou s hlavou; staré `.acc` překryvy se schovají (`.ayra-wear`).
    Rodič NECHCE kreslenou/jinou Ayru – vždy vycházet z původních obrázků (SVG verze i rozstříhané díly byly odmítnuty).
  - `rewards.js` – Ayřina bouda (nábytek, předměty, den/noc, triky, návštěvy kamarádů; rozmístění po řadách: u stěny / uprostřed /
    vepředu / na stěně, střed volný pro Ayru `HOME`; každý předmět má reakci v `REACT` – kam Ayra dojde, co udělá, co řekne, jak se věc hýbe;
    nově kreslené `FURN`: piano, guitar, micstand, rocker, dogbowl, dogball; úroveň je pod boudou `#kLevel`), cesta, tlapky + kolo štěstí,
    album sbírek (12×10), odznaky (5 stupňů), adventní kalendář, ozdoby na Ayře (`NECK`/`HEAD` SVG).
  - `play.js` – **Herna** (Zahrádka, Nakrm kamarády, Ubraň kostičky; hra stojí 1 🐾 – tlapek je tolik, kolik dní procvičovala,
    minus `pawSpent`; rozehraná hra se ukládá do `hplay` a pokračuje se v ní zdarma; Zahrádka = SVG květináč `plantSVG`), **návštěvy na Ayřině cestě** (na každé nové zastávce kamarád se 3 úkoly, `jvisit` = počet pozdravených,
    každá 3. zastávka rozcestí s pokladem), společné úkoly `makeTask` (počítání / najdi slabiku / přečti slovo a ukaž obrázek).
  - `play.js` také **Skládám slova** (v Psaní: Ayra řekne slovo z úkolů ze školy, skládá se z písmenkových kostek).
  - Nastavení rodiče (Pro rodiče): **probraná písmena** (`letters`, `App.allowed()` – filtruje Psaní, Skládání, Hernu, cestu, Ze všeho;
    úkoly ze školy ve Čtení zůstávají celé) a **do kolika počítáme** (5/10, `max` – dětský přepínač v Matematice je schovaný) a **délka kola** (`rlen` short/normal/long → `App.roundLen()`).
  - `progress.js` – sledování chyb/opakování, výzva dne, Přehled pro rodiče (podržet nadpis 2 s), logopedie tam.
  - `logo.js` – logopedie. `logo.css` – styly; na konci „jednotný vzhled tlačítek“ = všechna velká tlačítka (`.tile`, `.lesson`, `.challenge`,
    `.advcard`, `.rewbtn`) jako kompaktní pruh (ikona – tučný název – malý popisek), podle Herny/Adventního kalendáře (rodič to tak chce).
  - `voice/` – nahrávky: `phrases.json` (generuje `node tools/collect_phrases.js`), mp3 podle FNV-1a klíče,
    `voice/fixed/` slabiky a krátké samohlásky (hlas cs-CZ-Wavenet-A s IPA, dlouhé natažené atempo 0.7).
- `app/src/main/java/cz/matematika/sovicka/` – MainActivity (WebView, TTS most), CloudSpeech (Google STT), Updater.
- Workflows: `android.yml` (build + release), `voice.yml` (při změně phrases.json namluví nové věty hlasem
  Chirp3-HD-Sulafat a commitne), `syllables.yml` (při změně `tools/google_syllables.py` přenamluví slabiky),
  `voice_samples.yml` (ukázky hlasu k poslechu).
- Nové věty, které Ayra říká, se musí dostat do `phrases.json` (spustit `node tools/collect_phrases.js` před commitem).

## Stav k poslední verzi (v1.0.64)
Hotové vše výše. v1.0.58: úkol „Slabiky s T“ (23.–25. 11.) – poprvé i celá slova (dny „… – slova“,
Ayra říká „slovo“, rozpoznání chce téměř celé slovo, do hry Ze všeho jdou jen slabiky); slabiky s T v `google_syllables.py`. v1.0.59: rodič chtěl pryč mikrofon – Čtení jen s potvrzením rodiče, ze hry Ze všeho čtení nahlas úplně pryč;
Psaní uzná písmeno až při pokrytí ≥ 85 % a bez neobtaženého kousku (kontrola po částech).
v1.0.60 (podle nápadů z bystrohra.cz): hra „Přečti a ukaž obrázek“ ve Čtení, psací písmo se samo napíše + zelený start,
T v Psaní (t, T, ta–tu, táta, teta, léto, mapa), v Matematice po příkladu s nápovědou přijde o 3 dál podobný „ověřovací“ (max 2 za kolo, bez hvězdy).
Také v1.0.60 (inspirace hrou bystrohra.cz – vlastní provedení s Ayrou): Herna za tlapky, živá cesta s kamarády a rozcestím,
mapa cesty šedá před Ayrou.
Rozcvička ruky, Skládám slova, probraná písmena a délka kola – také v1.0.60.
Nápady na později: Kolik má slovo slabik (tleskání), Na co to začíná, krátká/dlouhá slabika, doplň číslo, slovní úlohy, krátké věty.
v1.0.61: Herna pokračuje v rozehrané hře bez další tlapky, nová kreslená Zahrádka, „Do kolika počítáme“ jen v nastavení rodiče.
v1.0.62: Ayra z rozstříhaných dílů (rodiči se nelíbila). v1.0.63: plynulá animace ohýbáním obrázku (WebGL), nově nakreslené ozdoby vkreslené do Ayry, přeuspořádaná bouda s reakcemi na všechny předměty.
v1.0.64: sjednocená menší tlačítka všude.
Po v1.0.64 (nevydáno): číslice, písmena, slabiky i slova jako skutečné tahy podle normy (animace, start, šipky, čísla tahů).
Psací písmo (malá, velká, slabiky, slova) se bere PŘÍMO z písma Slabikář: `node tools/font_render.js` (vykreslí) →
`python3 tools/font_strokes.py` (kostra → seřazené tahy, start oválu ve 2 h, CAP_START pro velká, diakritika až po slově) →
`www/write_font.js` (`FONT_STROKES`). Po přidání nových slov/slabik do Psaní obojí spustit znovu. Tiskací zůstává z `write_strokes.js`.
Otevřené / k ověření s rodičem: zda je obtahování teď přísné akorát, adventní kalendář od 1. 12.
