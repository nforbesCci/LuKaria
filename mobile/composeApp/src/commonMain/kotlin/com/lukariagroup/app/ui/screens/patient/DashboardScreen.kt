package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Dining
import androidx.compose.material.icons.filled.Healing
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.lukariagroup.app.data.models.AppNotification
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.DashboardAppIcon
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.navigation.AppRoute
import com.lukariagroup.app.ui.theme.LukariaGold
import com.lukariagroup.app.ui.theme.LukariaGoldDark
import com.lukariagroup.app.ui.theme.LukariaGoldLight

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
    val user = authViewModel.uiState.value.user
    var notifications by remember { mutableStateOf<List<AppNotification>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        runCatching { AppContainer.notificationRepository.fetch() }
            .onSuccess { result ->
                if (!result.success) {
                    error = result.error ?: "Failed to load notifications"
                } else {
                    notifications = result.notifications
                }
            }
            .onFailure { err ->
                val raw = err.message.orEmpty()
                error = Regex(""""error"\s*:\s*"([^"]+)"""")
                    .find(raw)?.groupValues?.getOrNull(1)
                    ?: raw.ifBlank { "Request failed" }
            }
    }

    val links = listOf(
        DashboardLink("Profile", AppRoute.ProfileWizard.route, Icons.Filled.Person, LukariaGold),
        DashboardLink("Consents", AppRoute.ConsentForms.route, Icons.AutoMirrored.Filled.Assignment, Color(0xFF5B7C99)),
        DashboardLink("Schedule", AppRoute.Schedule.route, Icons.Filled.CalendarMonth, Color(0xFF3D7A5A)),
        DashboardLink("Weight", AppRoute.WeightLogging.route, Icons.Filled.MonitorWeight, Color(0xFF8B6B4A)),
        DashboardLink("Meds", AppRoute.MedicationTracker.route, Icons.Filled.Medication, Color(0xFF6B5B95)),
        DashboardLink("Meals", AppRoute.MealTracker.route, Icons.Filled.Dining, Color(0xFFC4784A)),
        DashboardLink("Side effects", AppRoute.SideEffects.route, Icons.Filled.Healing, Color(0xFF9A4F5C)),
        DashboardLink("Membership", AppRoute.Membership.route, Icons.Filled.VideoLibrary, LukariaGoldDark),
        DashboardLink("Scanner", AppRoute.BarcodeScanner.route, Icons.Filled.QrCodeScanner, LukariaGoldLight),
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

        if (notifications.isNotEmpty()) {
            SectionTitle("Notifications")
            notifications.take(5).forEach { n ->
                Text(n.title ?: "Notice", style = MaterialTheme.typography.titleSmall)
                Text(n.message.orEmpty(), style = MaterialTheme.typography.bodyMedium)
            }
        }

        OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
            Text("Sign out")
        }
    }
}
