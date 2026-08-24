package com.lukariagroup.app.core

/**
 * Swift installs [scheduler] at app launch (see BookingReminderBridge.swift).
 * Local Notification Center alerts are scheduled via UNUserNotificationCenter.
 */
interface BookingReminderScheduler {
    fun ensurePermission()
    fun clear()
    fun schedule(startDateIso: String, endDateIso: String, title: String, message: String)
}

object BookingReminderHost {
    var scheduler: BookingReminderScheduler? = null
}

actual fun ensureNotificationPermission() {
    BookingReminderHost.scheduler?.ensurePermission()
}

actual fun clearBookingReminderNotifications() {
    BookingReminderHost.scheduler?.clear()
}

actual fun scheduleBookingReminderNotifications(
    startDateIso: String,
    endDateIso: String,
    title: String,
    message: String,
) {
    BookingReminderHost.scheduler?.schedule(startDateIso, endDateIso, title, message)
}
