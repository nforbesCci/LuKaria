package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.AppNotification
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun NotificationsScreen(onBack: () -> Unit) {
    var notifications by remember { mutableStateOf<List<AppNotification>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        error = null
        runCatching { AppContainer.notificationRepository.fetch() }
            .onSuccess { result ->
                if (!result.success) {
                    error = result.error ?: "Failed to load notifications"
                    notifications = emptyList()
                } else {
                    notifications = result.notifications.sortedByDescending { n ->
                        n.timestamp ?: n.reminderDay.orEmpty()
                    }
                }
            }
            .onFailure { err ->
                error = err.message ?: "Request failed"
            }
        loading = false
    }

    LukariaScaffold(title = "Notifications", onBack = onBack) {
        SectionTitle("Your notices")
        BodyCopy("Appointment reminders and clinic messages appear here.")
        ErrorText(error)
        if (loading) {
            LoadingBlock("Loading notifications…")
        } else if (notifications.isEmpty()) {
            BodyCopy("No notifications yet.")
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                notifications.forEach { n ->
                    NotificationCard(n)
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(n: AppNotification) {
    val dateLabel = formatNotificationDate(n.timestamp, n.reminderDay)
    val isDone = n.completed || n.read
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isDone) {
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f)
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            },
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isDone) 0.dp else 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                dateLabel,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                n.title ?: "Notice",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(top = 4.dp),
            )
            if (!n.message.isNullOrBlank()) {
                Text(
                    n.message,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
            if (isDone) {
                Text(
                    "Completed",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 8.dp),
                )
            } else if (!n.type.isNullOrBlank()) {
                Text(
                    n.type.replace('_', ' '),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        }
    }
}

private fun formatNotificationDate(timestamp: String?, reminderDay: String?): String {
    val iso = timestamp?.takeIf { it.isNotBlank() } ?: reminderDay?.takeIf { it.isNotBlank() }
        ?: return "Date unknown"
    // Prefer YYYY-MM-DD from reminderDay or start of ISO timestamp
    val dayPart = when {
        iso.length >= 10 && iso[4] == '-' && iso[7] == '-' -> iso.take(10)
        else -> iso.take(19).replace('T', ' ')
    }
    return try {
        val parts = dayPart.split("-").mapNotNull { it.toIntOrNull() }
        if (parts.size == 3) {
            val months = listOf(
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            )
            val y = parts[0]
            val m = parts[1]
            val d = parts[2]
            val timePart = if (timestamp != null && timestamp.contains('T') && timestamp.length >= 16) {
                val hm = timestamp.substring(11, 16)
                " · $hm"
            } else {
                ""
            }
            "${months.getOrElse(m - 1) { "?" }} $d, $y$timePart"
        } else {
            dayPart
        }
    } catch (_: Exception) {
        dayPart
    }
}
