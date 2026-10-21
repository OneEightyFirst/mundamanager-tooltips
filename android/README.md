# MundaMate Android

A personal Android wrapper for Munda Manager that automatically injects the
verified MundaMate tooltip rules.

The Android build copies `inject.js` and `rules.json` from the sibling
`mundamanager-tooltips` repository, making that repository the single source
of truth for tooltip behavior and rules text.

## Build

From this directory, use a Gradle 8.11.1 wrapper with Java 17 or newer:

```sh
./gradlew assembleDebug
```

The debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`.
