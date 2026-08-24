package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Biotech
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Dining
import androidx.compose.material.icons.filled.Healing
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.BookingReminder
import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.data.models.PreAppointmentTask
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.DashboardAppIcon
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.navigation.AppRoute
import com.lukariagroup.app.ui.theme.LukariaError
import com.lukariagroup.app.ui.theme.LukariaGold
import kotlinx.coroutines.launch
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.jsonPrimitive

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun PatientChartScreen(
    userId: String,
    onBack: () -> Unit,
    onNavigate: (String) -> Unit,
) {
    var profile by remember { mutableStateOf<PatientProfile?>(null) }
    var consultationOccurred by remember { mutableStateOf(false) }
    var tasks by remember { mutableStateOf<List<PreAppointmentTask>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var primaryRole by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf("") }
    var availableRoles by remember { mutableStateOf(listOf("Patient", "Doctor", "Admin")) }
    var rolesLoading by remember { mutableStateOf(false) }
    var savingRole by remember { mutableStateOf(false) }
    var roleMenuExpanded by remember { mutableStateOf(false) }
    var reminder by remember { mutableStateOf<BookingReminder?>(null) }
    var reminderStartDate by remember { mutableStateOf("") }
    var savingReminder by remember { mutableStateOf(false) }
    var showReminderPanel by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val sessionUser by AppContainer.authRepository.user.collectAsState()
    val canManageRoles = sessionUser?.isAdmin == true
    val isSelf = sessionUser?.sub == userId

    fun refresh() {
        scope.launch {
            loading = true
            error = null
            val errors = mutableListOf<String>()

            runCatching { AppContainer.adminRepository.fetchProfile(userId) }
                .onSuccess {
                    profile = it.profile ?: profile
                    val meta = it.profile?.userMetadata
                    if (meta != null) {
                        consultationOccurred =
                            meta["consultationOccurred"]?.jsonPrimitive?.booleanOrNull == true
                    }
                }
                .onFailure { errors += "Profile: ${it.message}" }

            runCatching { AppContainer.adminRepository.fetchDbProfile(userId) }
                .onSuccess {
                    if (profile == null) profile = it.profile
                    val meta = it.profile?.userMetadata
                    if (meta != null) {
                        consultationOccurred =
                            meta["consultationOccurred"]?.jsonPrimitive?.booleanOrNull == true
                    }
                }
                .onFailure { errors += "DB profile: ${it.message}" }

            runCatching { AppContainer.adminRepository.fetchPreAppointmentTasks(userId) }
                .onSuccess { tasks = it.tasks }
                .onFailure { errors += "Tasks: ${it.message}" }

            runCatching { AppContainer.adminRepository.fetchBookingReminder(userId) }
                .onSuccess {
                    reminder = it.reminder
                    if (reminderStartDate.isBlank()) {
                        reminderStartDate = it.reminder?.startDate.orEmpty()
                    }
                }
                .onFailure { errors += "Reminder: ${it.message}" }

            error = errors.takeIf { it.isNotEmpty() }?.joinToString("\n")
            loading = false
        }
    }

    fun loadRoles() {
        if (!canManageRoles) return
        scope.launch {
            rolesLoading = true
            runCatching { AppContainer.adminRepository.fetchUserRoles(userId) }
                .onSuccess { res ->
                    if (!res.success) {
                        error = res.error ?: res.details ?: "Failed to load roles"
                        return@onSuccess
                    }
                    val names = res.availableRoles.mapNotNull { it.name }.filter { it.isNotBlank() }
                    availableRoles = names.ifEmpty { listOf("Patient", "Doctor", "Admin") }
                    primaryRole = res.primaryRole.orEmpty()
                    selectedRole = res.primaryRole.orEmpty()
                }
                .onFailure { error = "Roles: ${it.message}" }
            rolesLoading = false
        }
    }

    LaunchedEffect(userId) { refresh() }
    LaunchedEffect(userId, canManageRoles) { loadRoles() }

    LukariaScaffold(title = "Patient chart", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it, color = MaterialTheme.colorScheme.primary) }

        SectionTitle(profile?.name ?: userId)
        BodyCopy(profile?.userEmail ?: profile?.email ?: "")

        SectionTitle("Actions")
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            DashboardAppIcon(
                label = if (consultationOccurred) "Disable Account" else "Enable Account",
                icon = if (consultationOccurred) Icons.Filled.Lock else Icons.Filled.LockOpen,
                containerColor = if (consultationOccurred) LukariaError else LukariaGold,
                onClick = {
                    scope.launch {
                        val next = !consultationOccurred
                        runCatching {
                            AppContainer.adminRepository.enableUser(userId, consultationOccurred = next)
                        }.onSuccess {
                            message = if (next) "Account enabled" else "Account disabled"
                            refresh()
                        }.onFailure { error = it.message }
                    }
                },
            )
            DashboardAppIcon(
                label = "Reschedule",
                icon = Icons.Filled.CalendarMonth,
                containerColor = Color(0xFF3D7A5A),
                onClick = { onNavigate(AppRoute.AdminChartReschedule.create(userId)) },
            )
            DashboardAppIcon(
                label = "Next appt reminder",
                icon = Icons.Filled.NotificationsActive,
                containerColor = Color(0xFF877449),
                onClick = { showReminderPanel = !showReminderPanel },
            )
            DashboardAppIcon(
                label = "Lab Requisition",
                icon = Icons.Filled.Biotech,
                containerColor = Color(0xFF5B7C99),
                onClick = { onNavigate(AppRoute.LabRequisitionForUser.create(userId)) },
            )
        }

        if (showReminderPanel) {
            SectionTitle("Next appointment reminder")
            BodyCopy(
                "Set the date the patient should start getting phone notifications to book their next visit. " +
                    "They will be reminded daily for one week.",
            )
            if (reminder?.active == true && !reminder?.startDate.isNullOrBlank()) {
                BodyCopy(
                    "Active: ${reminder?.startDate} → ${reminder?.endDate}" +
                        (reminder?.setByName?.let { " (set by $it)" } ?: ""),
                )
            }
            IsoDatePickerField(
                dateIso = reminderStartDate,
                onDateChange = { reminderStartDate = it },
                label = "Notify starting",
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    onClick = {
                        if (reminderStartDate.isBlank()) {
                            error = "Pick a start date for reminders"
                            return@Button
                        }
                        scope.launch {
                            savingReminder = true
                            runCatching {
                                AppContainer.adminRepository.setBookingReminder(userId, reminderStartDate)
                            }.onSuccess { res ->
                                if (!res.success) {
                                    error = res.error ?: "Failed to set reminder"
                                } else {
                                    reminder = res.reminder
                                    message = res.message ?: "Booking reminders scheduled for 7 days"
                                    error = null
                                }
                            }.onFailure { error = it.message }
                            savingReminder = false
                        }
                    },
                    enabled = !savingReminder && reminderStartDate.isNotBlank(),
                    modifier = Modifier.weight(1f),
                ) { Text(if (savingReminder) "Saving…" else "Schedule 7-day reminders") }
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            savingReminder = true
                            runCatching {
                                AppContainer.adminRepository.clearBookingReminder(userId)
                            }.onSuccess {
                                reminder = null
                                reminderStartDate = ""
                                message = "Booking reminders cleared"
                            }.onFailure { error = it.message }
                            savingReminder = false
                        }
                    },
                    enabled = !savingReminder && reminder?.active == true,
                ) { Text("Clear") }
            }
        }

        if (canManageRoles) {
            SectionTitle("User role")
            BodyCopy(
                if (isSelf) {
                    "You cannot change your own role."
                } else if (primaryRole.isNotBlank()) {
                    "Current role: $primaryRole"
                } else {
                    "Assign Patient, Doctor, or Admin."
                },
            )
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ExposedDropdownMenuBox(
                    expanded = roleMenuExpanded && !isSelf,
                    onExpandedChange = { if (!isSelf) roleMenuExpanded = it },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    OutlinedTextField(
                        value = selectedRole,
                        onValueChange = {},
                        readOnly = true,
                        enabled = !isSelf && !rolesLoading && !savingRole,
                        label = { Text("Role") },
                        trailingIcon = {
                            ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleMenuExpanded)
                        },
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth(),
                    )
                    ExposedDropdownMenu(
                        expanded = roleMenuExpanded && !isSelf,
                        onDismissRequest = { roleMenuExpanded = false },
                    ) {
                        availableRoles.forEach { role ->
                            DropdownMenuItem(
                                text = { Text(role) },
                                onClick = {
                                    selectedRole = role
                                    roleMenuExpanded = false
                                },
                            )
                        }
                    }
                }
                Button(
                    onClick = {
                        scope.launch {
                            savingRole = true
                            error = null
                            runCatching {
                                AppContainer.adminRepository.setUserRole(userId, selectedRole)
                            }.onSuccess { res ->
                                if (!res.success) {
                                    error = res.error ?: res.details ?: "Failed to update role"
                                } else {
                                    primaryRole = res.primaryRole ?: selectedRole
                                    selectedRole = primaryRole
                                    message = res.message ?: "Role updated to $primaryRole"
                                }
                            }.onFailure { error = it.message }
                            savingRole = false
                        }
                    },
                    enabled = !isSelf &&
                        !savingRole &&
                        !rolesLoading &&
                        selectedRole.isNotBlank() &&
                        selectedRole != primaryRole,
                ) {
                    Icon(
                        Icons.Filled.AdminPanelSettings,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp),
                    )
                    Text(if (savingRole) "Saving…" else "Assign role")
                }
            }
        }

        SectionTitle("Profile Completion Status")
        CompletionRow(
            label = "Account",
            done = consultationOccurred,
            doneText = "Active",
            incompleteText = "Disabled",
        )
        val orderedKeys = listOf(
            "completeMedicalProfile" to "Medical Profile",
            "enterWeightHeight" to "Weight and Height",
            "completeConsentForms" to "Consent Forms Complete",
            "prepareQuestions" to "Prepared Questions",
        )
        orderedKeys.forEach { (key, label) ->
            val task = tasks.find { it.taskKey == key }
            CompletionRow(
                label = label,
                done = task?.completed == true,
                doneText = "Completed",
                incompleteText = "Incomplete",
            )
        }

        SectionTitle("Chart sections")
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            DashboardAppIcon(
                label = "Profile Summary",
                icon = Icons.Filled.Person,
                containerColor = LukariaGold,
                onClick = { onNavigate(AppRoute.AdminChartProfile.create(userId)) },
            )
            DashboardAppIcon(
                label = "Consent Forms",
                icon = Icons.AutoMirrored.Filled.Assignment,
                containerColor = Color(0xFF5B7C99),
                onClick = { onNavigate(AppRoute.AdminChartConsents.create(userId)) },
            )
            DashboardAppIcon(
                label = "Side Effects",
                icon = Icons.Filled.Healing,
                containerColor = Color(0xFF9A4F5C),
                onClick = { onNavigate(AppRoute.AdminChartSideEffects.create(userId)) },
            )
            DashboardAppIcon(
                label = "Weight Logging",
                icon = Icons.Filled.MonitorWeight,
                containerColor = Color(0xFF8B6B4A),
                onClick = { onNavigate(AppRoute.AdminChartWeight.create(userId)) },
            )
            DashboardAppIcon(
                label = "Body Scan",
                icon = Icons.Filled.AccessibilityNew,
                containerColor = Color(0xFF4A6B8B),
                onClick = { onNavigate(AppRoute.AdminChartBodyScan.create(userId)) },
            )
            DashboardAppIcon(
                label = "Medication Tracker",
                icon = Icons.Filled.Medication,
                containerColor = Color(0xFF6B5B95),
                onClick = { onNavigate(AppRoute.AdminChartMedications.create(userId)) },
            )
            DashboardAppIcon(
                label = "Meal Tracker",
                icon = Icons.Filled.Dining,
                containerColor = Color(0xFFC4784A),
                onClick = { onNavigate(AppRoute.AdminChartMeals.create(userId)) },
            )
            DashboardAppIcon(
                label = "Questions",
                icon = Icons.Filled.HelpOutline,
                containerColor = Color(0xFF4A6FA5),
                onClick = { onNavigate(AppRoute.AdminChartQuestions.create(userId)) },
            )
        }
    }
}

@Composable
private fun CompletionRow(
    label: String,
    done: Boolean,
    doneText: String,
    incompleteText: String,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = if (done) Icons.Filled.CheckCircle else Icons.Filled.Cancel,
            contentDescription = null,
            tint = if (done) Color(0xFF3D7A5A) else LukariaError,
        )
        Text(
            text = "$label — ${if (done) doneText else incompleteText}",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f),
        )
    }
}
