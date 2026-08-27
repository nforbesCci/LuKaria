package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Dining
import androidx.compose.material.icons.filled.Healing
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.auth.AuthViewModel
import com.lukariagroup.app.core.clearBookingReminderNotifications
import com.lukariagroup.app.core.ensureNotificationPermission
import com.lukariagroup.app.core.scheduleBookingReminderNotifications
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.DashboardAppIcon
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.navigation.AppRoute
import com.lukariagroup.app.ui.theme.LukariaGold

private data class DashboardLink(
    val label: String,
    val route: String,
    val icon: ImageVector,
    val color: Color,
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DashboardScreen(
    authViewModel: AuthViewModel,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit,
    onLogout: () -> Unit,
) {
    val authState by authViewModel.uiState.collectAsState()
    val user = authState.user
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(authState.isLoggedIn) {
        if (!authState.isLoggedIn) return@LaunchedEffect
        error = null
        ensureNotificationPermission()
        // Schedule OS shade notifications for booking reminders (not shown on this screen).
        runCatching { AppContainer.notificationRepository.myBookingReminder() }
            .onSuccess { res ->
                val rem = res.reminder
                if (res.active && rem?.startDate != null && rem.endDate != null) {
                    scheduleBookingReminderNotifications(
                        startDateIso = rem.startDate,
                        endDateIso = rem.endDate,
                        title = "Book your next appointment",
                        message = "Please book your next visit with Dr Kadria Fairclough. Open Schedule to choose a time.",
                    )
                } else {
                    clearBookingReminderNotifications()
                }
            }
            .onFailure { err ->
                error = err.message
            }
    }

    val links = listOf(
        DashboardLink("Profile", AppRoute.ProfileWizard.route, Icons.Filled.Person, LukariaGold),
        DashboardLink("Consents", AppRoute.ConsentForms.route, Icons.AutoMirrored.Filled.Assignment, Color(0xFF5B7C99)),
        DashboardLink("Schedule", AppRoute.Schedule.route, Icons.Filled.CalendarMonth, Color(0xFF3D7A5A)),
        DashboardLink("Notifications", AppRoute.Notifications.route, Icons.Filled.Notifications, Color(0xFF877449)),
        DashboardLink("Weight", AppRoute.WeightLogging.route, Icons.Filled.MonitorWeight, Color(0xFF8B6B4A)),
        DashboardLink("Body scan", AppRoute.BodyScan.route, Icons.Filled.AccessibilityNew, Color(0xFF4A6B8B)),
        DashboardLink("Meds", AppRoute.MedicationTracker.route, Icons.Filled.Medication, Color(0xFF6B5B95)),
        DashboardLink("Meals", AppRoute.MealTracker.route, Icons.Filled.Dining, Color(0xFFC4784A)),
        DashboardLink("Side effects", AppRoute.SideEffects.route, Icons.Filled.Healing, Color(0xFF9A4F5C)),
    )

    LukariaScaffold(title = "Dashboard", onBack = onBack) {
        SectionTitle("Hello, ${user?.displayName ?: "Member"}")
        BodyCopy("Track your care plan between visits.")
        ErrorText(error)

        FlowRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp, bottom = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp, alignment = androidx.compose.ui.Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            maxItemsInEachRow = 4,
        ) {
            links.forEach { link ->
                DashboardAppIcon(
                    label = link.label,
                    icon = link.icon,
                    containerColor = link.color,
                    onClick = { onNavigate(link.route) },
                )
            }
        }

        OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
            Text("Sign out")
        }
    }
}
