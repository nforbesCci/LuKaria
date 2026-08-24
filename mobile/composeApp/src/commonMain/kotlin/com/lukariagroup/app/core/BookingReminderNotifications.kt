package com.lukariagroup.app.core

/**
 * Schedule (or clear) OS local notifications reminding the patient to book
 * their next appointment for each day in [startDateIso]..[endDateIso] (YYYY-MM-DD).
 */
expect fun scheduleBookingReminderNotifications(
    startDateIso: String,
    endDateIso: String,
    title: String,
    message: String,
)

expect fun clearBookingReminderNotifications()

expect fun ensureNotificationPermission()
