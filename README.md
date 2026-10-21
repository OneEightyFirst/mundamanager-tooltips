# MundaMate

N26 Necromunda rule tooltips for [Munda Manager](https://www.mundamanager.com/). Tap a skill, trait, special rule or wyrd power on a fighter card and you get the rule text, with its book and page.

This folder is the **only** source. Every target builds from it.

```
data/rules.json         rule name -> text (the catalog)
data/house-rules.json   house / category / source metadata (popup filters)
data/journal-index.json page index for the Escher and Goliath journals
src/inject.js           the tooltip script (rules are injected at build time)
chrome-extension/       popup + manifest for the desktop extension
android/                MundaMate Android app (WebView wrapper, com.oneeightyfirst.mundamate)
web/index.html          landing page at michaelfwells.com/munda/
scripts/build.py        builds dist/web and dist/chrome-extension
tests/browser.test.js   Playwright check of the built files
tools/special-rules-extraction/  how the Oct 2026 special-rules batch was pulled from the PDFs
```

Edit `data/` or `src/`, never `dist/`, which gets regenerated.

## Build and ship

```sh
python3 scripts/build.py              # writes dist/web and dist/chrome-extension
node tests/browser.test.js            # needs: npm i -D playwright
```

**Bookmarklet (michaelfwells.com/munda/):** upload `dist/web/inject.js` (and `index.html` if changed) to `/home/michjfbk/public_html/munda/` over SFTP (`mysite` alias). Back up the live file first.

**Chrome:** `chrome://extensions` → Developer mode → Load unpacked → `dist/chrome-extension/`. After a rebuild, hit reload on the extension.

**Android:** the app bundles `src/inject.js` + `data/rules.json` at build time, so it only changes when you rebuild and reinstall:

```sh
cd android
./gradlew assembleDebug               # Java 17+, Android SDK (sdk.dir in local.properties or ANDROID_HOME)
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK to the phone and open it. It installs over the existing app and keeps your Munda Manager login. Bump `versionCode`/`versionName` in `android/app/build.gradle` each release.

## Rule sources

N26 only: core rulebook, Gangs of the Underhive, Gangs of the Outlands, Most Wanted, the Escher (House of Blades) and Goliath (House of Chains) journals, and the September 2026 FAQ and errata, which wins when it changes a rule. The PDFs live in `Projects/Necromunda Rules/00 - Current N26 rules (use these)/`.

Entries added in 1.3.0 are verbatim from the books, with `(Source: book, PDF p. N)` under each. When the same rule name appears on several fighters with different wording, every version is listed. Territories, side jobs, alliances and gang-building rules aren't in the catalog on purpose.

## Versions

- 1.3.0 / Android 1.0.4 (Oct 2026): consolidated into this repo; 350 rules (added 166 fighter/gang special rules and wyrd powers, including Poison Blood, Nimble, Furious Charge, Combat Chems Stash, Counter-charge, Leash Range); FAQ errata for Bodyguard and Extra Arm.
- 1.2.0 (Oct 19 2026): bookmarklet rebuilt on 184 N26 rules, searchable "Rules · N26" library.
- 1.1.1 (Sep 7 2026): Chrome popup crash fix, weapon profile tables.
- Android 1.0.3 (Aug 15 2026): first WebView wrapper build.

## Downloading the Android app

Run `scripts/release-android.sh` on the Mac (builds, copies the APK to `releases/`, commits), then `git push origin main`. On the phone, open:

https://oneeightyfirst.github.io/mundamanager-tooltips/releases/MundaMate-latest.apk

Android asks once to allow installs from the browser. Always build on the same Mac: Android only updates the installed app if the new APK is signed with the same key (the Mac's `~/.android/debug.keystore`).
