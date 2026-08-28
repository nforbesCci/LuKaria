package com.lukariagroup.app.core

/** Today's date as `YYYY-MM-DD` in the device local timezone. */
expect fun todayIsoDate(): String

/**
 * Format DatePicker selection millis (`YYYY-MM-DD`).
 * Material3 DatePicker uses UTC midnight — implementations should decode as UTC.
 */
expect fun epochMillisToIsoDate(millis: Long): String

/** Parse `YYYY-MM-DD` to UTC start-of-day epoch millis for DatePicker state. */
expect fun isoDateToEpochMillis(iso: String): Long?

/** IANA timezone id for the device (e.g. `America/Jamaica`). */
expect fun deviceTimeZoneId(): String

/** Local `YYYY-MM-DD` for an instant ISO string in the device timezone. */
expect fun instantToLocalDateIso(instantIso: String): String

/** Local start-of-day instant ISO for a `YYYY-MM-DD` calendar day. */
expect fun localDateStartInstantIso(dateIso: String): String

/** Local wall-clock time label (e.g. `2:30 PM`) for an instant ISO string. */
expect fun formatInstantLocalTime(instantIso: String): String
