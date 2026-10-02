#!/usr/bin/env bash
# Boots iPhone 6.9" and iPad 13" simulators, opens each screen and saves App Store screenshots.
# Usage: capture-app-store-screenshots.sh <path-to-.app> <output-dir>
# Optional env: LUKARIA_SCREENSHOT_TOKEN (Bearer JWT for a demo patient account).
set -euo pipefail

APP_PATH="$1"
OUT_DIR="$2"
BUNDLE_ID="com.lukaria.svelte"
ROUTES=(home patient/dashboard patient/weight patient/medications patient/body-scan contact)

mkdir -p "$OUT_DIR"

runtime=$(xcrun simctl list runtimes -j | python3 -c '
import json, sys
rs = [r for r in json.load(sys.stdin)["runtimes"] if r["platform"] == "iOS" and r["isAvailable"]]
print(sorted(rs, key=lambda r: [int(x) for x in r["version"].split(".")])[-1]["identifier"])')

device_type() {
  xcrun simctl list devicetypes -j | python3 -c '
import json, re, sys
pattern = re.compile(sys.argv[1])
types = [t for t in json.load(sys.stdin)["devicetypes"] if pattern.search(t["name"])]
print(types[-1]["identifier"])' "$1"
}

capture() {
  local label="$1" type="$2"
  local udid
  udid=$(xcrun simctl create "shots-$label" "$type" "$runtime")
  xcrun simctl boot "$udid"
  xcrun simctl bootstatus "$udid" -b
  xcrun simctl status_bar "$udid" override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 \
    --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
  xcrun simctl install "$udid" "$APP_PATH"
  xcrun simctl privacy "$udid" grant camera "$BUNDLE_ID" || true
  xcrun simctl privacy "$udid" grant photos "$BUNDLE_ID" || true

  local i=1
  for route in "${ROUTES[@]}"; do
    SIMCTL_CHILD_LUKARIA_SCREENSHOT_TOKEN="${LUKARIA_SCREENSHOT_TOKEN:-}" \
    SIMCTL_CHILD_LUKARIA_SCREENSHOT_ROUTE="$route" \
      xcrun simctl launch --terminate-running-process "$udid" "$BUNDLE_ID"
    sleep 20
    xcrun simctl io "$udid" screenshot "$OUT_DIR/${label}-$(printf '%02d' "$i")-${route//\//-}.png"
    i=$((i + 1))
  done

  xcrun simctl shutdown "$udid"
  xcrun simctl delete "$udid"
}

capture iphone "$(device_type '^iPhone \d+ Pro Max$')"
capture ipad "$(device_type '^iPad Pro 13-inch')"

ls -la "$OUT_DIR"
