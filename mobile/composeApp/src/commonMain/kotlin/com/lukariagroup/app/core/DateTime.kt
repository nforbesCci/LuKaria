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
