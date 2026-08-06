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

## If TestFlight deploy fails on signing

The **Compile ComposeApp (iOS)** job validates Kotlin/Native builds. The deploy job needs an **Apple Distribution** certificate.

If CI logs show `reached the maximum number of available Distribution certificates`:

1. Open [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list) → **Distribution** → revoke unused/expired certs (Apple allows 3 active).
2. Re-run **Actions → iOS Build & TestFlight**.

Alternatively, export a Distribution `.p12` from Keychain Access and add repo secrets:

```text
IOS_DISTRIBUTION_CERT_P12_BASE64=<base64 of .p12 file>
IOS_DISTRIBUTION_CERT_PASSWORD=<p12 export password>
```

## First deploy checklist

1. App exists in App Store Connect: **Svelte by Lukaria** / `com.lukaria.svelte`
2. Bundle ID matches `mobile/iosApp/Configuration/Config.xcconfig`
3. `API_BASE_URL` in that xcconfig must use `https:/$()/www…` (plain `https://` is truncated by xcconfig `//` comments and ships as `https:`, which Ktor resolves to `localhost:443`)
4. ASC API key has **Admin** (needed so Fastlane can create the Distribution cert + App Store profile)
5. Commit + push `mobile/` and `.github/workflows/ios.yml` to `master`
6. Watch **Actions → iOS Build & TestFlight**

Deploy uses Fastlane (`mobile/fastlane`) to create an **Apple Distribution** certificate and App Store provisioning profile (no physical device required), then uploads to TestFlight. The CI keychain is cached so later runs can reuse the cert private key.
