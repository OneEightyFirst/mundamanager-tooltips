#!/bin/bash
# Build the Android app on this Mac and publish the APK into releases/ for download.
#   scripts/release-android.sh            # then: git push origin main
# Download link once pushed:
#   https://oneeightyfirst.github.io/mundamanager-tooltips/releases/MundaMate-latest.apk
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(sed -n "s/.*versionName '\(.*\)'.*/\1/p" android/app/build.gradle)
python3 scripts/build.py
# Gradle needs Java 17+. Use JAVA_HOME if set, else a system JDK, else Android Studio's or Homebrew's.
if [ -z "${JAVA_HOME:-}" ] && ! /usr/libexec/java_home -v 17+ >/dev/null 2>&1; then
  BREW=$(command -v brew >/dev/null && brew --prefix || echo /opt/homebrew)
  for jdk in "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
             "$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
             "$BREW/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
             "$BREW/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" \
             "$BREW/opt/openjdk/libexec/openjdk.jdk/Contents/Home" \
             "$HOME"/.gradle/jdks/*/Contents/Home "$HOME"/.gradle/jdks/*; do
    [ -x "$jdk/bin/java" ] && export JAVA_HOME="$jdk" && break
  done
fi
if [ -z "${JAVA_HOME:-}" ] && ! /usr/libexec/java_home -v 17+ >/dev/null 2>&1; then
  echo "No Java 17+ found. Install one with:  brew install openjdk@17   then re-run this script."; exit 1
fi
echo "Building Android app (first run downloads Gradle; can take a few minutes)..."
(cd android && ./gradlew assembleDebug --console=plain)
cp android/app/build/outputs/apk/debug/app-debug.apk "releases/MundaMate-$VERSION.apk"
cp "releases/MundaMate-$VERSION.apk" releases/MundaMate-latest.apk
git add releases/
git commit -m "Android $VERSION APK" releases/
echo "Built releases/MundaMate-$VERSION.apk. Push with: git push origin main"
