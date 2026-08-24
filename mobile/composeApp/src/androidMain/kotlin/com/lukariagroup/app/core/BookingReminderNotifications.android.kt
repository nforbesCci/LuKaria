package com.lukariagroup.app.core

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.lukariagroup.app.AndroidAppContext
import com.lukariagroup.app.MainActivity
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId

private const val CHANNEL_ID = "booking_reminders_v2"
private const val PREFS = "booking_reminders"
private const val REQ_BASE = 7100
private const val NOTIFY_HOUR = 9
/** Stable id so today's reminder updates in the shade instead of stacking forever. */
private const val TODAY_NOTIFY_ID = 7099

actual fun ensureNotificationPermission() {
    val context = AndroidAppContext.getOrNull() ?: return
    ensureChannel(context)
}

actual fun clearBookingReminderNotifications() {
    val context = AndroidAppContext.getOrNull() ?: return
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val count = prefs.getInt("count", 0)
    for (i in 0 until count.coerceAtLeast(14)) {
        val intent = Intent(context, BookingReminderReceiver::class.java)
        val pi = PendingIntent.getBroadcast(
            context,
            REQ_BASE + i,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        alarmManager.cancel(pi)
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.cancel(TODAY_NOTIFY_ID)
    for (i in 0 until count.coerceAtLeast(14)) {
        manager.cancel(REQ_BASE + i)
    }
    prefs.edit().clear().apply()
}

actual fun scheduleBookingReminderNotifications(
    startDateIso: String,
    endDateIso: String,
    title: String,
    message: String,
) {
    val context = AndroidAppContext.getOrNull() ?: return
    ensureChannel(context)
    clearBookingReminderNotifications()

    val zone = ZoneId.systemDefault()
    val start = runCatching { LocalDate.parse(startDateIso.trim()) }.getOrNull() ?: return
    val end = runCatching { LocalDate.parse(endDateIso.trim()) }.getOrNull() ?: return
    if (end.isBefore(start)) return

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
    var index = 0
    var day = start
    val today = LocalDate.now(zone)
    while (!day.isAfter(end) && index < 14) {
        var fireAt = LocalDateTime.of(day, LocalTime.of(NOTIFY_HOUR, 0))
            .atZone(zone)
            .toInstant()
            .toEpochMilli()
        // If today's 9am already passed, fire shortly so the patient still gets today's ping.
        if (day == today && fireAt <= System.currentTimeMillis()) {
            fireAt = System.currentTimeMillis() + 5_000L
        }
        if (fireAt > System.currentTimeMillis() - 5_000L) {
            val intent = Intent(context, BookingReminderReceiver::class.java).apply {
                putExtra(BookingReminderReceiver.EXTRA_TITLE, title)
                putExtra(BookingReminderReceiver.EXTRA_MESSAGE, message)
                putExtra(BookingReminderReceiver.EXTRA_DAY, day.toString())
                putExtra(
                    BookingReminderReceiver.EXTRA_ID,
                    if (day == today) TODAY_NOTIFY_ID else REQ_BASE + index,
                )
            }
            val pi = PendingIntent.getBroadcast(
                context,
                REQ_BASE + index,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            scheduleAlarm(alarmManager, fireAt, pi)
            index += 1
        }
        day = day.plusDays(1)
    }
    prefs.putInt("count", index).apply()

    // Show immediately in the notification shade when today is inside the window.
    if (!today.isBefore(start) && !today.isAfter(end)) {
        postSystemBookingReminder(
            context = context,
            id = TODAY_NOTIFY_ID,
            title = title,
            message = message,
        )
    }
}

private fun scheduleAlarm(alarmManager: AlarmManager, fireAt: Long, pi: PendingIntent) {
    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
                return
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
            return
        }
    } catch (_: SecurityException) {
        // fall through
    }
    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
        } else {
            @Suppress("DEPRECATION")
            alarmManager.set(AlarmManager.RTC_WAKEUP, fireAt, pi)
        }
    } catch (_: SecurityException) {
        @Suppress("DEPRECATION")
        alarmManager.set(AlarmManager.RTC_WAKEUP, fireAt, pi)
    }
}

private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
        CHANNEL_ID,
        "Appointment reminders",
        NotificationManager.IMPORTANCE_HIGH,
    ).apply {
        description = "Reminders to book your next appointment — shown in the notification shade"
        enableVibration(true)
        setShowBadge(true)
    }
    manager.createNotificationChannel(channel)
}

internal fun postSystemBookingReminder(
    context: Context,
    id: Int,
    title: String,
    message: String,
) {
    ensureChannel(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
        PackageManager.PERMISSION_GRANTED
    ) {
        return
    }

    val openIntent = Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        putExtra("open_route", "patient/schedule")
    }
    val contentPi = PendingIntent.getActivity(
        context,
        id,
        openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_popup_reminder)
        .setContentTitle(title)
        .setContentText(message)
        .setStyle(NotificationCompat.BigTextStyle().bigText(message))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setCategory(NotificationCompat.CATEGORY_REMINDER)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setAutoCancel(true)
        .setContentIntent(contentPi)
        .setDefaults(NotificationCompat.DEFAULT_ALL)
        .build()

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(id, notification)
}

class BookingReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val title = intent?.getStringExtra(EXTRA_TITLE) ?: "Book your next appointment"
        val message = intent?.getStringExtra(EXTRA_MESSAGE)
            ?: "Please book your next visit. Open Schedule in the app to choose a time."
        val id = intent?.getIntExtra(EXTRA_ID, TODAY_NOTIFY_ID) ?: TODAY_NOTIFY_ID
        postSystemBookingReminder(context, id, title, message)
    }

    companion object {
        const val EXTRA_TITLE = "title"
        const val EXTRA_MESSAGE = "message"
        const val EXTRA_DAY = "day"
        const val EXTRA_ID = "id"
    }
}
