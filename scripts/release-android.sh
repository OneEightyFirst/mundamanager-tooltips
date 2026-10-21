#!/bin/bash
# Build the Android app on this Mac and publish the APK into releases/ for download.
#   scripts/release-android.sh            # then: git push origin main
# Download link once pushed:
#   https://oneeightyfirst.github.io/mundamanager-tooltips/releases/MundaMate-latest.apk
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(sed -n "s/.*versionName '\(.*\)'.*/\1/p" android/app/build.gradle)
python3 scripts/build.py
# Gradle needs Java 17+. Fall back to the JDK bundled with Android Studio if none is set up.
if ! /usr/libexec/java_home -v 17+ >/dev/null 2>&1 && [ -z "${JAVA_HOME:-}" ]; then
  for jbr in "/Applications/Android Studio.app/Contents/jbr/Contents/Home" "$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home"; do
    [ -d "$jbr" ] && export JAVA_HOME="$jbr" && break
  done
fi
[ -n "${JAVA_HOME:-}" ] || /usr/libexec/java_home -v 17+ >/dev/null 2>&1 || { echo "No Java 17+ found. Install Android Studio or run: brew install openjdk@17"; exit 1; }
echo "Building Android app (first run downloads Gradle; can take a few minutes)..."
(cd android && ./gradlew assembleDebug --console=plain)
cp android/app/build/outputs/apk/debug/app-debug.apk "releases/MundaMate-$VERSION.apk"
cp "releases/MundaMate-$VERSION.apk" releases/MundaMate-latest.apk
git add releases/
git commit -m "Android $VERSION APK" releases/
echo "Built releases/MundaMate-$VERSION.apk. Push with: git push origin main"
