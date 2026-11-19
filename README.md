# Počítání se Sovičkou 🦉

Mluvící matematická hra pro prvňáčky (Android).

**Co umí**
- 🐊 **Větší, menší, rovná se** – porovnávání dvou skupinek obrázků (`<`, `=`, `>`)
- 🍎 **Sčítání** a 🎈 **Odčítání** – s obrázky, které se dají spočítat
- 🎲 **Všechno dohromady** – míchané příklady
- přepínač **do 5 / do 10**
- **schování obrázků** (🙈) – počítá se jen s čísly; když si neví rady, Sovička obrázky ukáže a spočítá je
- Sovička oslovuje **Leontýnku** (jméno je v `index.html` v konstantě `VOC`)
- Sovička vše **čte nahlas česky** (zadání, pochvalu i správné řešení)
- klepnutím na skupinku obrázků je Sovička nahlas **spočítá**; po dvou chybách počítá sama a napoví
- hvězdičky za správné odpovědi napoprvé a **sbírka nálepek** (nová za každých 10 ⭐)

## Jak aplikaci dostat do telefonu
1. Na GitHubu otevři v tomto repozitáři **Releases** (vpravo) a v telefonu stáhni nejnovější `pocitani-se-sovickou.apk`.
2. Otevři stažený soubor a povol instalaci z „neznámých zdrojů“ (telefon se zeptá).
3. Spusť aplikaci **Počítání**.

APK se sestaví automaticky (GitHub Actions) po každé změně v repozitáři.

### Když Sovička nemluví
Aplikace používá hlas zabudovaný v Androidu. Pokud chybí čeština:
**Nastavení → Usnadnění (nebo Systém → Jazyky) → Převod textu na řeč** → modul Google → nainstalovat hlasová data **Čeština**.

## Pro vývoj
- celá hra je v `app/src/main/assets/www/index.html` (lze otevřít i v prohlížeči na počítači)
- Android obal (WebView + čeština přes TextToSpeech): `app/src/main/java/cz/matematika/sovicka/MainActivity.java`
- sestavení: `./gradlew assembleRelease` (vyžaduje Android SDK)
- `app/sovicka.keystore` je záměrně v repozitáři, aby šly nové verze instalovat přes staré (heslo `sovicka`).
