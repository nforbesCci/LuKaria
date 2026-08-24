package com.lukariagroup.app.core

actual fun scheduleBookingReminderNotifications(
    startDateIso: String,
    endDateIso: String,
    title: String,
    message: String,
) {
    // iOS local notifications can be added later with UNUserNotificationCenter.
}

actual fun clearBookingReminderNotifications() = Unit

actual fun ensureNotificationPermission() = Unit
