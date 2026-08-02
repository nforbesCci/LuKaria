# Calendar settings (Calendly)

Admin → **System Settings → Calendar** stores Mongo `settings.calendar_config` (same pattern as Serenity).

## What it drives

| Surface | Behavior |
|---------|----------|
| Public CTAs (web) | `GET /api/calendar` via `useBookingUrl` / `BookingButton` / `BookingLink` |
| Patient dashboard “Book” | Same public booking URL |
| Kotlin Schedule → Calendly | Fetches `/api/calendar` (fallback: `PlatformConfig.calendlyBookingUrl`) |
| Authenticated `/schedule` | Still **Carepatron** (unchanged) |

## Admin fields

- Provider (calendly / cal.com / outlook / google)
- Booking URL (required)
- Event type URL / API URI (optional)
- Button label
- Enabled toggle
- Optional API token + webhook signing key (stored for future Calendly API sync)

## APIs

- `GET/PUT /api/admin/settings/calendar` — admin/doctor
- `GET /api/calendar` — public `{ bookingUrl, eventTypeUrl, bookingLabel, provider, enabled }`

Default booking URL: `https://calendly.com/kadriaf-lukariagroup/weight-loss-consultation`
