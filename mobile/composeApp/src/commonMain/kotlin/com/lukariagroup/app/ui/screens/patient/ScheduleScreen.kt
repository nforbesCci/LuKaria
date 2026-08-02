package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.core.openExternalUrl
import com.lukariagroup.app.data.models.AppointmentInfo
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Composable
fun ScheduleScreen(onBack: () -> Unit) {
    var appointment by remember { mutableStateOf<AppointmentInfo?>(null) }
    var configured by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var reason by remember { mutableStateOf("") }
    var preferred by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var calendlyUrl by remember { mutableStateOf(PlatformConfig.calendlyBookingUrl) }
    var calendlyLabel by remember { mutableStateOf("Open Calendly") }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.appointmentRepository.check() }
                .onSuccess {
                    appointment = it.appointment
                    configured = it.configured
                    error = null
                }
                .onFailure { error = it.message }
            runCatching { AppContainer.calendarRepository.fetchPublic() }
                .onSuccess { res ->
                    res.calendar?.bookingUrl?.takeIf { it.isNotBlank() }?.let { calendlyUrl = it }
                    res.calendar?.bookingLabel?.takeIf { it.isNotBlank() }?.let { calendlyLabel = it }
                }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Schedule", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Book appointment")
        BodyCopy("Opens Carepatron in your browser. After booking, return here and tap Refresh (or complete via deep link).")
        Button(
            onClick = { openExternalUrl(PlatformConfig.carepatronBookingUrl) },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Open Carepatron booking") }
        OutlinedButton(
            onClick = { openExternalUrl(calendlyUrl) },
            modifier = Modifier.fillMaxWidth(),
        ) { Text(calendlyLabel) }
        OutlinedButton(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.appointmentRepository.save(
                            buildJsonObject {
                                put("source", "mobile_carepatron_return")
                                put("status", "scheduled")
                            },
                        )
                    }.onSuccess {
                        message = "Appointment saved"
                        refresh()
                    }.onFailure { error = it.message }
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("I finished booking — save & refresh") }

        SectionTitle("Upcoming visit")
        if (appointment != null) {
            BodyCopy("Start: ${appointment?.startTime ?: "—"}")
            BodyCopy("End: ${appointment?.endTime ?: "—"}")
            BodyCopy("Status: ${appointment?.status ?: "—"}")
            appointment?.joinUrl?.let { BodyCopy("Join: $it") }
        } else {
            BodyCopy(if (configured) "No upcoming appointment on file." else "Appointment booking is not configured yet.")
        }

        OutlinedButton(onClick = { refresh() }, modifier = Modifier.fillMaxWidth()) {
            Text("Refresh")
        }

        SectionTitle("Request reschedule")
        OutlinedTextField(reason, { reason = it }, label = { Text("Reason") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(preferred, { preferred = it }, label = { Text("Preferred times") }, modifier = Modifier.fillMaxWidth())
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.appointmentRepository.requestReschedule(reason, preferred)
                    }.onSuccess {
                        message = "Reschedule request submitted"
                        error = null
                    }.onFailure { error = it.message }
                }
            },
            enabled = reason.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Submit reschedule request")
        }
    }
}
