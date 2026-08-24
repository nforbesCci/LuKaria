package com.lukariagroup.app.core

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale

actual fun todayIsoDate(): String =
    LocalDate.now(ZoneId.systemDefault()).toString()

actual fun epochMillisToIsoDate(millis: Long): String =
    Instant.ofEpochMilli(millis).atZone(ZoneOffset.UTC).toLocalDate().toString()

actual fun isoDateToEpochMillis(iso: String): Long? =
    runCatching {
        LocalDate.parse(iso.trim())
            .atStartOfDay(ZoneOffset.UTC)
            .toInstant()
            .toEpochMilli()
    }.getOrNull()

actual fun deviceTimeZoneId(): String = ZoneId.systemDefault().id

actual fun instantToLocalDateIso(instantIso: String): String =
    runCatching {
        Instant.parse(instantIso.trim()).atZone(ZoneId.systemDefault()).toLocalDate().toString()
    }.getOrElse { instantIso.take(10) }

actual fun localDateStartInstantIso(dateIso: String): String =
    runCatching {
        LocalDate.parse(dateIso.trim())
            .atStartOfDay(ZoneId.systemDefault())
            .toInstant()
            .toString()
    }.getOrElse { "${dateIso.trim()}T00:00:00.000Z" }

actual fun formatInstantLocalTime(instantIso: String): String =
    runCatching {
        val zoned = Instant.parse(instantIso.trim()).atZone(ZoneId.systemDefault())
        zoned.format(DateTimeFormatter.ofPattern("h:mm a", Locale.getDefault()))
    }.getOrElse { instantIso }
