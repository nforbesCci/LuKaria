# Android CI / Play Store

## What runs on check-in

Workflow: [`.github/workflows/android.yml`](../.github/workflows/android.yml)

| Trigger | What runs |
|---------|-----------|
| Push / PR that changes `mobile/**` | Assembles `:composeApp:assembleRelease` (compile check; unsigned OK) |
| Push to `master` / `workflow_dispatch` | Signs AAB + uploads to Play Console **internal** testing via Fastlane |

Package ID: `com.lukariagroup.app`  
`versionCode` = GitHub Actions `run_number`  
`versionName` = `1.0.0` (bump in the workflow env when you ship a marketing version)

## One-time Play Console setup

1. Create the app in [Google Play Console](https://play.google.com/console) with application id `com.lukariagroup.app` (must match [`composeApp/build.gradle.kts`](../mobile/composeApp/build.gradle.kts)).
2. Complete enough of the Play setup checklist that the API can create an internal release (privacy policy, content rating, target countries — testers cannot install until these are done, but AAB upload can succeed earlier).
3. Create an **upload keystore** locally and keep a secure backup:

```bash
keytool -genkeypair -v \
  -keystore lukaria-upload.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias lukaria \
  -storepass '<keystore-password>' \
  -keypass '<key-password>'
```

4. Enroll **Play App Signing** and register this keystore as the upload key (Play Console → App integrity).
5. Create a Google Cloud **service account**, enable the **Google Play Android Developer API**, and download a JSON key.
6. In Play Console → Users and permissions, invite that service account email with permission to release to testing tracks (at least **Release apps to testing tracks**).
7. Add the GitHub Actions secrets below.

### Encode the keystore for GitHub

```bash
# macOS / Linux
base64 -i lukaria-upload.jks | pbcopy

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("lukaria-upload.jks")) | Set-Clipboard
```

Paste the value into secret `ANDROID_KEYSTORE_BASE64` (single line, no wrapping).

## Required GitHub secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Upload keystore (`.jks` / `.keystore`) as base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g. `lukaria`) |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAY_STORE_JSON_KEY` | Full Play Developer API service account JSON body |

## Local signed bundle (optional)

```bash
cd mobile
export ANDROID_KEYSTORE_PATH=/absolute/path/to/lukaria-upload.jks
export ANDROID_KEYSTORE_PASSWORD=...
export ANDROID_KEY_ALIAS=lukaria
export ANDROID_KEY_PASSWORD=...
./gradlew :composeApp:bundleRelease -PVERSION_CODE=2 -PVERSION_NAME=1.0.0
```

AAB output: `composeApp/build/outputs/bundle/release/composeApp-release.aab`

Upload with Fastlane (JSON key on disk):

```bash
export PLAY_STORE_JSON_KEY_PATH=/absolute/path/to/play-store.json
export VERSION_CODE=2
export VERSION_NAME=1.0.0
bundle exec fastlane android internal
```

## First deploy checklist

1. App exists in Play Console: `com.lukariagroup.app`
2. All five secrets above are set
3. Service account can release to the **internal** track
4. Commit + push `mobile/` and `.github/workflows/android.yml` to `master`
5. Watch **Actions → Android Build & Play Store**
6. In Play Console → Testing → Internal testing, add testers and share the link

CI does **not** auto-promote to production. Promote from internal → closed/open/production in Play Console when ready.

## If deploy fails

| Symptom | Fix |
|---------|-----|
| Missing secret … | Add the secret; see table above |
| Package not found | Create the Play app with id `com.lukariagroup.app` |
| Insufficient permissions | Grant the service account release access on that app |
| Wrong key / signature | Re-export upload keystore; update `ANDROID_KEYSTORE_*` secrets |
| versionCode already used | `run_number` must increase; re-run on a new workflow run |
