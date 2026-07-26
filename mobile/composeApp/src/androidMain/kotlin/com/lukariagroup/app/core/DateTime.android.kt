package com.lukariagroup.app.core

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset

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
