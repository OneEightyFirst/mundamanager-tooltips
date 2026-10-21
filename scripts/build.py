#!/usr/bin/env python3
"""Build every MundaMate target from the single source in data/ and src/.

  python3 scripts/build.py

Outputs (all generated; never edit by hand):
  dist/web/              -> upload to michaelfwells.com/munda/ (bookmarklet loads inject.js)
  dist/chrome-extension/ -> Chrome "Load unpacked"
The Android app (android/) reads src/inject.js and data/rules.json directly at Gradle build time.
"""
import json, pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLACEHOLDER = "/*__MUNDAMATE_RULES__*/null"

def main():
    rules = json.loads((ROOT / "data/rules.json").read_text(encoding="utf-8"))
    meta = json.loads((ROOT / "data/house-rules.json").read_text(encoding="utf-8"))
    missing_meta = [k for k in meta if k not in rules]
    if missing_meta:
        sys.exit(f"house-rules.json has entries with no rule: {missing_meta}")
    src = (ROOT / "src/inject.js").read_text(encoding="utf-8")
    if src.count(PLACEHOLDER) != 1:
        sys.exit("src/inject.js must contain the rules placeholder exactly once")
    bundled = src.replace(PLACEHOLDER, json.dumps(rules, ensure_ascii=False, separators=(",", ":")))

    dist = ROOT / "dist"
    if dist.exists():
        shutil.rmtree(dist)
    web = dist / "web"; web.mkdir(parents=True)
    (web / "inject.js").write_text(bundled, encoding="utf-8")
    shutil.copy(ROOT / "web/index.html", web / "index.html")

    ext = dist / "chrome-extension"
    shutil.copytree(ROOT / "chrome-extension", ext)
    (ext / "inject.js").write_text(bundled, encoding="utf-8")
    for name in ("rules.json", "house-rules.json"):
        shutil.copy(ROOT / "data" / name, ext / name)

    print(f"Built {len(rules)} rules -> dist/web, dist/chrome-extension")

if __name__ == "__main__":
    main()
