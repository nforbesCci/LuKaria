package com.lukariagroup.app.core

import platform.Foundation.NSCalendar
import platform.Foundation.NSDate
import platform.Foundation.NSDateComponents
import platform.Foundation.NSDateFormatter
import platform.Foundation.NSLocale
import platform.Foundation.NSTimeZone
import platform.Foundation.dateWithTimeIntervalSince1970
import platform.Foundation.localeWithLocaleIdentifier
import platform.Foundation.timeIntervalSince1970
import platform.Foundation.timeZoneWithName

actual fun todayIsoDate(): String {
    val formatter = NSDateFormatter().apply {
        dateFormat = "yyyy-MM-dd"
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
        // Default timeZone is the device local zone.
    }
    return formatter.stringFromDate(NSDate())
}

actual fun epochMillisToIsoDate(millis: Long): String {
    val formatter = NSDateFormatter().apply {
        dateFormat = "yyyy-MM-dd"
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
        timeZone = NSTimeZone.timeZoneWithName("UTC")!!
    }
    val date = NSDate.dateWithTimeIntervalSince1970(millis / 1000.0)
    return formatter.stringFromDate(date)
}

actual fun isoDateToEpochMillis(iso: String): Long? {
    val parts = iso.trim().split("-")
    if (parts.size != 3) return null
    val year = parts[0].toLongOrNull() ?: return null
    val month = parts[1].toLongOrNull() ?: return null
    val day = parts[2].toLongOrNull() ?: return null
    val components = NSDateComponents().apply {
        this.year = year
        this.month = month
        this.day = day
        this.hour = 0
        this.minute = 0
        this.second = 0
    }
    val calendar = NSCalendar.currentCalendar.apply {
        timeZone = NSTimeZone.timeZoneWithName("UTC")!!
    }
    val date = calendar.dateFromComponents(components) ?: return null
    return (date.timeIntervalSince1970 * 1000.0).toLong()
}

actual fun deviceTimeZoneId(): String =
    NSTimeZone.localTimeZone.name ?: "America/Jamaica"

actual fun instantToLocalDateIso(instantIso: String): String {
    val instant = parseInstant(instantIso) ?: return instantIso.take(10)
    val formatter = NSDateFormatter().apply {
        dateFormat = "yyyy-MM-dd"
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
    }
    return formatter.stringFromDate(instant)
}

actual fun localDateStartInstantIso(dateIso: String): String {
    val parts = dateIso.trim().split("-")
    if (parts.size != 3) return "${dateIso.trim()}T00:00:00.000Z"
    val year = parts[0].toLongOrNull() ?: return "${dateIso.trim()}T00:00:00.000Z"
    val month = parts[1].toLongOrNull() ?: return "${dateIso.trim()}T00:00:00.000Z"
    val day = parts[2].toLongOrNull() ?: return "${dateIso.trim()}T00:00:00.000Z"
    val components = NSDateComponents().apply {
        this.year = year
        this.month = month
        this.day = day
        this.hour = 0
        this.minute = 0
        this.second = 0
    }
    val calendar = NSCalendar.currentCalendar
    val date = calendar.dateFromComponents(components) ?: return "${dateIso.trim()}T00:00:00.000Z"
    val formatter = NSDateFormatter().apply {
        dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
        timeZone = NSTimeZone.timeZoneWithName("UTC")!!
    }
    return formatter.stringFromDate(date)
}

actual fun formatInstantLocalTime(instantIso: String): String {
    val instant = parseInstant(instantIso) ?: return instantIso
    val formatter = NSDateFormatter().apply {
        dateFormat = "h:mm a"
        locale = NSLocale.currentLocale
    }
    return formatter.stringFromDate(instant)
}

private fun parseInstant(instantIso: String): NSDate? {
    val trimmed = instantIso.trim()
    val formatter = NSDateFormatter().apply {
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
        timeZone = NSTimeZone.timeZoneWithName("UTC")!!
        dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    }
    formatter.dateFromString(trimmed)?.let { return it }
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    formatter.dateFromString(trimmed)?.let { return it }
    val epoch = trimmed
        .removeSuffix("Z")
        .substringBefore('.')
        .let { base ->
            val f = NSDateFormatter().apply {
                locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
                timeZone = NSTimeZone.timeZoneWithName("UTC")!!
                dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            }
            f.dateFromString(base)
        }
    return epoch
}
