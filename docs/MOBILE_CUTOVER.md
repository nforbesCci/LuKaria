# Dual clients — React web + Kotlin mobile

## Status

Both apps are maintained as first-class clients against the same Next.js `/api/*` + MongoDB backend:

| Client | Location | Auth |
|--------|----------|------|
| **React (Next.js)** | repo root (`app/`, `components/`, …) | Auth0 cookie session (`@auth0/nextjs-auth0`) |
| **Kotlin Multiplatform** | [`mobile/`](../mobile/) | Auth0 native app + Bearer JWT |

Web keeps full product UI (marketing, patient, admin) **and** SEO. Mobile is a parallel Compose Multiplatform client for Android/iOS — not a replacement that removes the web app.

## Shared backend contract

- Prefer additive API changes; avoid breaking existing web payloads.
- Auth helper [`lib/api-auth.js`](../lib/api-auth.js) accepts **cookie session or** `Authorization: Bearer <token>`.
- New features should ship on both clients when they are user-facing (or document intentional web-only / mobile-only exceptions).

## Auth0 apps

| App | Role |
|-----|------|
| **Svelte by Lukaria** (SPA / web) | Existing web login |
| **Lukaria Mobile** (`AUTH0_NATIVE_CLIENT_ID`) | Native login, callback `lukaria://callback` |
| **Lukaria API** (`AUTH0_AUDIENCE` = `https://www.lukariagroup.com/api`) | JWT access tokens for mobile → `/api/*` |
| **Management** M2M | Admin user management + Auth0 automation |

## Kotlin config

`PlatformConfig` (android/ios): domain `auth.lukariagroup.com`, native client ID, audience `https://www.lukariagroup.com/api`. See [`mobile/README.md`](../mobile/README.md).

## Lab PDF

- Web: client-generated PDF → `POST /api/pdf/send`
- Mobile: structured JSON → `POST /api/pdf/lab-requisition` (server PDF + SharePoint/email)

## Store checklist (mobile)

- [ ] Privacy Policy / Terms URLs in store listings
- [ ] Camera permission copy (barcode)
- [ ] Health-adjacent data disclosures
- [ ] Auth0 production native client + audience
- [ ] `apiBaseUrl` = production
- [ ] Carepatron / Calendly URLs verified
- [ ] Play Console app + CI secrets (see [`ANDROID_CI.md`](ANDROID_CI.md))
- [ ] App Store / TestFlight CI secrets (see [`IOS_CI.md`](IOS_CI.md))
