package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MenuAnchorType
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
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.AppointmentInfo
import com.lukariagroup.app.data.models.BookableType
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ScheduleScreen(onBack: () -> Unit) {
    var types by remember { mutableStateOf<List<BookableType>>(emptyList()) }
    var selectedType by remember { mutableStateOf<BookableType?>(null) }
    var typeMenuOpen by remember { mutableStateOf(false) }
    var dayIso by remember { mutableStateOf(todayIsoDate()) }
    var slots by remember { mutableStateOf<List<String>>(emptyList()) }
    var selectedSlot by remember { mutableStateOf<String?>(null) }
    var appointment by remember { mutableStateOf<AppointmentInfo?>(null) }
    var loading by remember { mutableStateOf(true) }
    var booking by remember { mutableStateOf(false) }
    var reason by remember { mutableStateOf("") }
    var preferred by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refreshUpcoming() {
        scope.launch {
            runCatching { AppContainer.appointmentRepository.check() }
                .onSuccess { appointment = it.appointment }
        }
    }

    fun loadTypes() {
        scope.launch {
            loading = true
            runCatching { AppContainer.appointmentRepository.bookable() }
                .onSuccess { res ->
                    types = res.types.filter { !it.eventTypeUri.isNullOrBlank() }
                    if (selectedType == null) selectedType = types.firstOrNull()
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
            refreshUpcoming()
        }
    }

    fun loadSlots() {
        val uri = selectedType?.eventTypeUri ?: return
        scope.launch {
            loading = true
            selectedSlot = null
            runCatching {
                val start = "${dayIso}T00:00:00.000Z"
                val end = "${nextIsoDay(dayIso)}T00:00:00.000Z"
                AppContainer.appointmentRepository.availability(uri, start, end)
            }.onSuccess { res ->
                slots = res.slots.mapNotNull { it.startTime }
                error = null
            }.onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { loadTypes() }
    LaunchedEffect(selectedType?.eventTypeUri, dayIso) {
        if (selectedType?.eventTypeUri != null) loadSlots()
    }

    LukariaScaffold(title = "Schedule", onBack = onBack) {
        if (loading && types.isEmpty()) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Book appointment")
        BodyCopy("Choose an appointment type your care team allows, pick a day, then confirm a time.")

        if (types.isEmpty() && !loading) {
            BodyCopy("No bookable appointment types are configured yet. Ask your clinic to enable Calendly types in admin settings.")
        } else {
            ExposedDropdownMenuBox(
                expanded = typeMenuOpen,
                onExpandedChange = { typeMenuOpen = it },
            ) {
                OutlinedTextField(
                    value = selectedType?.name ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Appointment type") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(typeMenuOpen) },
                    modifier = Modifier
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                        .fillMaxWidth(),
                )
                ExposedDropdownMenu(
                    expanded = typeMenuOpen,
                    onDismissRequest = { typeMenuOpen = false },
                ) {
                    types.forEach { t ->
                        DropdownMenuItem(
                            text = { Text(t.name ?: t.id ?: "Type") },
                            onClick = {
                                selectedType = t
                                typeMenuOpen = false
                            },
                        )
                    }
                }
            }

            IsoDatePickerField(dateIso = dayIso, onDateChange = { dayIso = it })

            SectionTitle("Available times")
            if (slots.isEmpty()) {
                BodyCopy("No open slots on this day.")
            } else {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    slots.forEach { slot ->
                        FilterChip(
                            selected = selectedSlot == slot,
                            onClick = { selectedSlot = slot },
                            label = { Text(formatSlotLabel(slot)) },
                        )
                    }
                }
            }

            Button(
                onClick = {
                    val type = selectedType
                    val slot = selectedSlot
                    if (type?.eventTypeUri == null || slot == null) return@Button
                    scope.launch {
                        booking = true
                        runCatching {
                            AppContainer.appointmentRepository.book(
                                eventTypeUri = type.eventTypeUri!!,
                                startTime = slot,
                                typeName = type.name,
                            )
                        }.onSuccess {
                            message = "Appointment booked"
                            selectedSlot = null
                            refreshUpcoming()
                            loadSlots()
                        }.onFailure { error = it.message }
                        booking = false
                    }
                },
                enabled = selectedType != null && selectedSlot != null && !booking,
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (booking) "Booking…" else "Confirm booking") }
        }

        SectionTitle("Upcoming visit")
        if (appointment?.startTime != null) {
            BodyCopy("Start: ${appointment?.startTime}")
            BodyCopy("End: ${appointment?.endTime ?: "—"}")
            BodyCopy("Status: ${appointment?.status ?: "—"}")
        } else {
            BodyCopy("No upcoming appointment on file.")
        }

        SectionTitle("Request reschedule")
        OutlinedTextField(reason, { reason = it }, label = { Text("Reason") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(preferred, { preferred = it }, label = { Text("Preferred times") }, modifier = Modifier.fillMaxWidth())
        OutlinedButton(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.appointmentRepository.requestReschedule(reason, preferred)
                    }.onSuccess {
                        message = "Reschedule request sent"
                        reason = ""
                        preferred = ""
                    }.onFailure { error = it.message }
                }
            },
            enabled = reason.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Submit reschedule request") }
    }
}

private fun nextIsoDay(iso: String): String {
    val parts = iso.split("-").mapNotNull { it.toIntOrNull() }
    if (parts.size != 3) return iso
    val y = parts[0]
    val m = parts[1]
    val d = parts[2]
    val daysInMonth = when (m) {
        1, 3, 5, 7, 8, 10, 12 -> 31
        4, 6, 9, 11 -> 30
        2 -> if (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0)) 29 else 28
        else -> 30
    }
    val (ny, nm, nd) = when {
        d < daysInMonth -> Triple(y, m, d + 1)
        m < 12 -> Triple(y, m + 1, 1)
        else -> Triple(y + 1, 1, 1)
    }
    return "${ny.toString().padStart(4, '0')}-${nm.toString().padStart(2, '0')}-${nd.toString().padStart(2, '0')}"
}

private fun formatSlotLabel(iso: String): String {
    val timePart = iso.substringAfter('T', "").take(5)
    if (timePart.length < 5) return iso.takeLast(8)
    val h = timePart.substring(0, 2).toIntOrNull() ?: return timePart
    val min = timePart.substring(3, 5)
    val ampm = if (h >= 12) "PM" else "AM"
    val h12 = when {
        h == 0 -> 12
        h > 12 -> h - 12
        else -> h
    }
    return "$h12:$min $ampm"
}
