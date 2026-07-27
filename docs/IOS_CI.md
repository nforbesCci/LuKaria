# iOS CI / TestFlight

## Why Actions were not running before

There were no workflow files under `.github/workflows/`. That is fixed by [`ios.yml`](../.github/workflows/ios.yml).

## What runs on check-in

- **Any push/PR that changes `mobile/**`**: compiles the Kotlin `ComposeApp` iOS framework (`iosArm64` release).
- **Push to `master` (or manual “Run workflow”)**: full Xcode archive + TestFlight upload for **Svelte by Lukaria** (`com.lukaria.svelte`).

## One secret still needed

ASC API secrets are already on the repo. Add:

```text
APPLE_TEAM_ID=<your 10-character Apple Developer Team ID>
```

Find it in [Apple Developer → Membership](https://developer.apple.com/account) or Xcode → Settings → Accounts.

## First deploy checklist

1. App exists in App Store Connect: **Svelte by Lukaria** / `com.lukaria.svelte`
2. Bundle ID matches `mobile/iosApp/Configuration/Config.xcconfig`
3. ASC API key has **Admin** (needed so Fastlane can create the Distribution cert + App Store profile)
4. Commit + push `mobile/` and `.github/workflows/ios.yml` to `master`
5. Watch **Actions → iOS Build & TestFlight**

Deploy uses Fastlane (`mobile/fastlane`) to create an **Apple Distribution** certificate and App Store provisioning profile (no physical device required), then uploads to TestFlight. The CI keychain is cached so later runs can reuse the cert private key.
