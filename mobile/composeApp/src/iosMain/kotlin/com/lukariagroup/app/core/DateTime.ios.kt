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
        timeZone = NSTimeZone.systemTimeZone
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
