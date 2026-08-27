package com.lukariagroup.app.ui.screens.admin

import androidx.compose.runtime.Composable
import com.lukariagroup.app.ui.screens.patient.ScheduleScreen

@Composable
fun AdminPatientRescheduleScreen(userId: String, onBack: () -> Unit) {
    ScheduleScreen(
        forUserId = userId,
        title = "Reschedule",
        onBack = onBack,
    )
}
