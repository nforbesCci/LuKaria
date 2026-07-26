# Lukaria Mobile (Kotlin Multiplatform + Compose Multiplatform)

Native Android / iOS client for the Lukaria clinical telehealth app. Talks to the existing Next.js backend at `/api/*` using Auth0 Bearer tokens (see `lib/api-auth.js` on the web repo).

## Project layout

```
mobile/
  settings.gradle.kts
  build.gradle.kts
  gradle/libs.versions.toml
  composeApp/
    src/commonMain/…   shared UI, repositories, auth
    src/androidMain/…  MainActivity, SharedPreferences TokenStore, PNG signature export
    src/iosMain/…      MainViewController, NSUserDefaults TokenStore
```

Package: `com.lukariagroup.app`

## Configure API base URL

Default is production:

```kotlin
// androidMain + iosMain PlatformConfig
apiBaseUrl = "https://www.lukariagroup.com"
```

For local Next.js (emulator):

| Platform | Suggested `apiBaseUrl` |
|----------|------------------------|
| Android **debug** | `https://127.0.0.1:3000` + `adb reverse tcp:3000 tcp:3000` |
| iOS simulator | `https://localhost:3000` (trust local CA in keychain if prompted) |
| Release builds | `https://www.lukariagroup.com` |

Debug Android trusts the local self-signed cert in `PlatformHttpClient.android.kt`. **Production only accepts Auth0 cookie sessions today** until `lib/api-auth.js` + middleware Bearer support are deployed — debug builds must hit local `npm run dev` (HTTPS).

## Auth0 native setup

Create a **Native** application in Auth0 (separate from the Next.js web app).

1. **Allowed Callback URLs**
   - `lukaria://callback`
2. **Allowed Logout URLs**
   - `lukaria://callback`
3. **Allowed Origins (CORS)** — not required for native Custom Tabs; ensure the API validates JWTs with the correct audience.
4. Enable the **Authorization Code + PKCE** grant (recommended). Implicit / fragment tokens also work with the deep-link handler in `MainActivity` for early testing.
5. Set an **API Audience** that matches the backend:

```env
AUTH0_AUDIENCE=https://www.lukariagroup.com/api
```

(or your `NEXT_PUBLIC_AUTH0_AUDIENCE` value)

6. Put values into both platform `PlatformConfig` actuals:

| Field | Example |
|-------|---------|
| `auth0Domain` | `your-tenant.auth0.com` |
| `auth0ClientId` | Native app Client ID |
| `auth0Audience` | `https://www.lukariagroup.com/api` |
| `auth0CallbackUrl` | `lukaria://callback` |

### Roles claim

Staff detection uses `https://lukariagroup.com/roles` (Patient / Admin / Doctor), same as the web app.

### Dev login without Auth0 UI

On **Login**, paste an access token issued for the API audience. The app stores it in platform prefs and sends `Authorization: Bearer …` on every Ktor call.

`openAuth0Login()` opens the Auth0 `/authorize` URL in the system browser; deep link `lukaria://callback` is registered in `AndroidManifest.xml`.

## Build commands

From `mobile/`:

```bash
# Android debug APK
./gradlew :composeApp:assembleDebug

# Install on connected device / emulator
./gradlew :composeApp:installDebug

# Compile shared + Android
./gradlew :composeApp:compileDebugKotlinAndroid

# iOS frameworks (requires macOS + Xcode)
./gradlew :composeApp:linkDebugFrameworkIosSimulatorArm64
```

Windows:

```powershell
.\gradlew.bat :composeApp:assembleDebug
```

### iOS Xcode project

This repo ships the KMP shared module. Create an Xcode app that embeds the `ComposeApp` framework and calls `MainViewController()` (standard CMP iOS host). URL scheme `lukaria` must be registered for Auth0 callbacks.

## Feature coverage (M0–M5)

| Area | Screens / APIs |
|------|----------------|
| Marketing | Home, Info, About, FAQ, Contact, Testimonials, Services, Legal, Blog |
| Auth | Login + token paste + Auth0 deep link |
| Patient | Dashboard, Profile, Consents + SignaturePad, Schedule, Weight, Meds, Meals, Side effects, Membership, Barcode |
| Admin | Home, Patient chart, Reschedule queue, Side-effect review, Lab PDF, Blog CMS |

Repositories mirror web routes such as `/api/profile/fetch`, `/api/consent/*/save`, `/api/measurements/*`, `/api/admin/*`, etc.

## Signature pad

`SignaturePad` stores stroke points in common code and exports a `data:image/png;base64,…` string via expect/actual (Android `Bitmap` encode; iOS CoreGraphics / PNG).

## Cutover / dual clients

Both the React web app and the Kotlin mobile app are maintained. See [`../docs/MOBILE_CUTOVER.md`](../docs/MOBILE_CUTOVER.md) for Auth0 setup, shared API auth, and lab PDF endpoints. There is no plan to remove authenticated web UI.
