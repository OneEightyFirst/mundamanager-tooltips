#!/bin/bash
# Build the Android app on this Mac and publish the APK into releases/ for download.
#   scripts/release-android.sh            # then: git push origin main
# Download link once pushed:
#   https://oneeightyfirst.github.io/mundamanager-tooltips/releases/MundaMate-latest.apk
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(sed -n "s/.*versionName '\(.*\)'.*/\1/p" android/app/build.gradle)
python3 scripts/build.py
(cd android && ./gradlew -q assembleDebug)
cp android/app/build/outputs/apk/debug/app-debug.apk "releases/MundaMate-$VERSION.apk"
cp "releases/MundaMate-$VERSION.apk" releases/MundaMate-latest.apk
git add releases/
git commit -m "Android $VERSION APK" releases/
echo "Built releases/MundaMate-$VERSION.apk. Push with: git push origin main"
