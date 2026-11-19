# Leontýnčina škola 🐶

Mluvící aplikace pro prvňáčky (Android): matematika, logopedie, brzy i čtení.

**Matematika**
- 🐊 **Větší, menší, rovná se** – porovnávání dvou skupinek obrázků (`<`, `=`, `>`)
- 🍎 **Sčítání** a 🎈 **Odčítání** – s obrázky, které se dají spočítat
- 🎲 **Všechno dohromady** – míchané příklady
- přepínač **do 5 / do 10**
- **schování obrázků** (🙈) – počítá se jen s čísly; když si neví rady, Ayra obrázky ukáže a spočítá je
- Na obrazovce Ayra oslovuje **Leontýnku**; nahlas jméno neříká (hlas ho neumí vyslovit plynule).
- Ayra vše **čte nahlas česky** (zadání, pochvalu i správné řešení)
- klepnutím na skupinku obrázků je Ayra nahlas **spočítá**; po dvou chybách počítá sama a napoví
- hvězdičky za správné odpovědi napoprvé a **sbírka 30 nálepek**; každá další stojí víc (10, 15, 20 … ⭐), na úvodní obrazovce ukazatel postupu

**Logopedie (C S Z / Č Š Ž)**
- ke každé hlásce obrázek úst zepředu i z boku (kde je jazyk, kudy jde vzduch); u Č Š Ž podle logopedky špička jazyka dolů a prst pod bradou, na který jazyk míří, postup krok za krokem čtený nahlas a ukázka zvuku
- 🪞 zrcátko (přední kamera vedle obrázku úst) a 🔴 nahrávání – Leontýnka si poslechne, jak to řekla
- slabiky a slova s obrázky, poslechová hra „S nebo Š?“, „Z nebo Ž?“, „C nebo Č?“
- logopedie je rozdělená do lekcí (zatím Lekce 1: sykavky); nová lekce se přidá do pole `LESSONS` v `logo.js`
- rozcvička pusinky (úsměv–pusinka, jazýček výtah, koník…)
- nic se nikam neodesílá; jde o pomůcku k domácímu cvičení, přednost mají pokyny logopedky

**Čtení (úkoly ze školy)**
- slabiky s obrázky, tabulky slabik po dnech jako na papíru (klepnutím se slabika přečte)
- úkoly rozdělené po dnech (dnešní den zvýrazněný, přečtený den ✅)
- „Čti se Ayrou“: aplikace označí slabiku a mikrofonem poslouchá; správně → další, špatně → zkusit znovu / nápověda, nepřečtené se vrací na konec; ✓ = ruční potvrzení
- hra „Najdi slabiku“
- nový úkol se přidá do pole `R_LESSONS` v `read.js`

## Jak aplikaci dostat do telefonu
1. Na GitHubu otevři v tomto repozitáři **Releases** (vpravo) a v telefonu stáhni nejnovější `leontyncina-skola.apk`.
2. Otevři stažený soubor a povol instalaci z „neznámých zdrojů“ (telefon se zeptá).
3. Spusť aplikaci **Leontýnčina škola**.

APK se sestaví po každé změně (kontrola), ale nová verze se vydá jen ručně: Actions → Sestavit APK → Run workflow, nebo commit se slovem [vydat].

### Aktualizace
Aplikace při každém spuštění sama zjistí, jestli je na GitHubu (Releases) novější verze, a nabídne ji stáhnout a nainstalovat. Poprvé Android požádá o povolení „Instalovat z tohoto zdroje“. Hvězdičky a nálepky zůstanou. Aplikace stahuje z veřejného repozitáře https://github.com/Ugga83/leontyncina-skola (Releases).

### Když Ayra nemluví
Aplikace používá hlas zabudovaný v Androidu. Pokud chybí čeština:
**Nastavení → Usnadnění (nebo Systém → Jazyky) → Převod textu na řeč** → modul Google → nainstalovat hlasová data **Čeština**.

## Hlas
Věty mluví český hlas **Google Chirp 3 HD „Sulafat“**, slabiky hlas Google Wavenet s přesně předepsanou výslovností (IPA).
Všechny zvuky jsou předem namluvené a uložené v aplikaci (`app/src/main/assets/www/voice/`), takže aplikace Google nevolá a nic se neplatí.
Po změně textů: `node tools/collect_phrases.js`, pak `GOOGLE_TTS_KEY=... python tools/gen_voice.py` (namluví jen nové věty; slabiky `tools/google_syllables.py`). Klíč se do repozitáře neukládá.

## Pro vývoj
- hra je v `app/src/main/assets/www/` (`index.html` = rozcestník a matematika, `logo.js`/`logo.css` = logopedie) (lze otevřít i v prohlížeči na počítači)
- Android obal (WebView + čeština přes TextToSpeech): `app/src/main/java/cz/matematika/sovicka/MainActivity.java`
- sestavení: `./gradlew assembleRelease` (vyžaduje Android SDK)
- `app/sovicka.keystore` je záměrně v repozitáři, aby šly nové verze instalovat přes staré (heslo `sovicka`).
