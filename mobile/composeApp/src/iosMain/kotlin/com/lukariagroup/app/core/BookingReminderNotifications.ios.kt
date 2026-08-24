package com.lukariagroup.app.core

import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSCalendar
import platform.Foundation.NSCalendarUnitDay
import platform.Foundation.NSDateComponents
import platform.Foundation.NSDateFormatter
import platform.Foundation.NSLocale
import platform.Foundation.NSUserDefaults
import platform.Foundation.localeWithLocaleIdentifier
import platform.Foundation.timeIntervalSince1970
import platform.UserNotifications.UNAuthorizationOptionAlert
import platform.UserNotifications.UNAuthorizationOptionBadge
import platform.UserNotifications.UNAuthorizationOptionSound
import platform.UserNotifications.UNCalendarNotificationTrigger
import platform.UserNotifications.UNMutableNotificationContent
import platform.UserNotifications.UNNotificationRequest
import platform.UserNotifications.UNNotificationSound
import platform.UserNotifications.UNNotificationTrigger
import platform.UserNotifications.UNTimeIntervalNotificationTrigger
import platform.UserNotifications.UNUserNotificationCenter

private const val ID_PREFIX = "booking-reminder-"
private const val ID_TODAY = "booking-reminder-today"
private const val PREFS_IDS = "booking_reminder_notification_ids"
private const val NOTIFY_HOUR = 9L
private const val NOTIFY_MINUTE = 0L

@OptIn(ExperimentalForeignApi::class)
actual fun ensureNotificationPermission() {
    val center = UNUserNotificationCenter.currentNotificationCenter()
    val options =
        UNAuthorizationOptionAlert or
            UNAuthorizationOptionSound or
            UNAuthorizationOptionBadge
    center.requestAuthorizationWithOptions(options) { _, _ -> }
}

@OptIn(ExperimentalForeignApi::class)
actual fun clearBookingReminderNotifications() {
    val center = UNUserNotificationCenter.currentNotificationCenter()
    val defaults = NSUserDefaults.standardUserDefaults
    @Suppress("UNCHECKED_CAST")
    val stored = defaults.arrayForKey(PREFS_IDS) as? List<*>
    val ids = buildList {
        stored?.forEach { (it as? String)?.let(::add) }
        add(ID_TODAY)
    }.distinct()
    if (ids.isNotEmpty()) {
        center.removePendingNotificationRequestsWithIdentifiers(ids)
        center.removeDeliveredNotificationsWithIdentifiers(ids)
    }
    defaults.removeObjectForKey(PREFS_IDS)

    // Also sweep any leftover booking-reminder-* requests.
    center.getPendingNotificationRequestsWithCompletionHandler { requests ->
        val leftover = requests
            ?.mapNotNull { req ->
                val id = req.identifier
                if (id.startsWith(ID_PREFIX)) id else null
            }
            .orEmpty()
        if (leftover.isNotEmpty()) {
            center.removePendingNotificationRequestsWithIdentifiers(leftover)
        }
    }
    center.getDeliveredNotificationsWithCompletionHandler { delivered ->
        val leftover = delivered
            ?.mapNotNull { note ->
                val id = note.request.identifier
                if (id.startsWith(ID_PREFIX)) id else null
            }
            .orEmpty()
        if (leftover.isNotEmpty()) {
            center.removeDeliveredNotificationsWithIdentifiers(leftover)
        }
    }
}

@OptIn(ExperimentalForeignApi::class)
actual fun scheduleBookingReminderNotifications(
    startDateIso: String,
    endDateIso: String,
    title: String,
    message: String,
) {
    ensureNotificationPermission()
    clearBookingReminderNotifications()

    val days = eachInclusiveDay(startDateIso.trim(), endDateIso.trim())
    if (days.isEmpty()) return

    val todayIso = todayIsoDate()
    val center = UNUserNotificationCenter.currentNotificationCenter()
    val scheduledIds = mutableListOf<String>()

    days.forEach { dayIso ->
        val parts = dayIso.split("-").mapNotNull { it.toIntOrNull() }
        if (parts.size != 3) return@forEach
        val year = parts[0]
        val month = parts[1]
        val day = parts[2]

        if (dayIso < todayIso) return@forEach

        if (dayIso == todayIso) {
            val id = ID_TODAY
            addTimeIntervalNotification(
                center = center,
                identifier = id,
                title = title,
                message = message,
                seconds = 2.0,
            )
            scheduledIds += id
            return@forEach
        }

        val components = NSDateComponents().apply {
            this.year = year.toLong()
            this.month = month.toLong()
            this.day = day.toLong()
            this.hour = NOTIFY_HOUR
            this.minute = NOTIFY_MINUTE
            this.second = 0
        }
        val trigger = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
            dateComponents = components,
            repeats = false,
        )
        val id = "$ID_PREFIX$dayIso"
        addNotification(
            center = center,
            identifier = id,
            title = title,
            message = message,
            trigger = trigger,
        )
        scheduledIds += id
    }

    if (scheduledIds.isNotEmpty()) {
        NSUserDefaults.standardUserDefaults.setObject(scheduledIds, PREFS_IDS)
    }
}

@OptIn(ExperimentalForeignApi::class)
private fun addTimeIntervalNotification(
    center: UNUserNotificationCenter,
    identifier: String,
    title: String,
    message: String,
    seconds: Double,
) {
    val trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(
        timeInterval = seconds.coerceAtLeast(1.0),
        repeats = false,
    )
    addNotification(center, identifier, title, message, trigger)
}

@OptIn(ExperimentalForeignApi::class)
private fun addNotification(
    center: UNUserNotificationCenter,
    identifier: String,
    title: String,
    message: String,
    trigger: UNNotificationTrigger,
) {
    val content = UNMutableNotificationContent().apply {
        this.title = title
        this.body = message
        this.sound = UNNotificationSound.defaultSound
    }
    val request = UNNotificationRequest.requestWithIdentifier(
        identifier = identifier,
        content = content,
        trigger = trigger,
    )
    center.addNotificationRequest(request) { _ -> }
}

@OptIn(ExperimentalForeignApi::class)
private fun eachInclusiveDay(startIso: String, endIso: String): List<String> {
    val startParts = startIso.split("-").mapNotNull { it.toIntOrNull() }
    val endParts = endIso.split("-").mapNotNull { it.toIntOrNull() }
    if (startParts.size != 3 || endParts.size != 3) return emptyList()

    val calendar = NSCalendar.currentCalendar
    val startComponents = NSDateComponents().apply {
        year = startParts[0].toLong()
        month = startParts[1].toLong()
        day = startParts[2].toLong()
        hour = 12
        minute = 0
        second = 0
    }
    val endComponents = NSDateComponents().apply {
        year = endParts[0].toLong()
        month = endParts[1].toLong()
        day = endParts[2].toLong()
        hour = 12
        minute = 0
        second = 0
    }
    var cursor = calendar.dateFromComponents(startComponents) ?: return emptyList()
    val endDate = calendar.dateFromComponents(endComponents) ?: return emptyList()
    if (cursor.timeIntervalSince1970 > endDate.timeIntervalSince1970) return emptyList()

    val formatter = NSDateFormatter().apply {
        dateFormat = "yyyy-MM-dd"
        locale = NSLocale.localeWithLocaleIdentifier("en_US_POSIX")
        timeZone = calendar.timeZone
    }

    val out = mutableListOf<String>()
    var guard = 0
    while (cursor.timeIntervalSince1970 <= endDate.timeIntervalSince1970 + 1.0 && guard < 14) {
        out += formatter.stringFromDate(cursor)
        cursor = calendar.dateByAddingUnit(
            unit = NSCalendarUnitDay,
            value = 1,
            toDate = cursor,
            options = 0u,
        ) ?: break
        guard += 1
    }
    return out
}
