package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.deviceTimeZoneId
import com.lukariagroup.app.core.formatInstantLocalTime
import com.lukariagroup.app.core.instantToLocalDateIso
import com.lukariagroup.app.core.localDateStartInstantIso
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.AvailabilitySlot
import com.lukariagroup.app.data.models.BookableType
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ScheduleScreen(
    forUserId: String? = null,
    title: String = "Schedule Appointment",
    onBack: () -> Unit,
) {
    var types by remember { mutableStateOf<List<BookableType>>(emptyList()) }
    var selectedType by remember { mutableStateOf<BookableType?>(null) }
    var typeMenuOpen by remember { mutableStateOf(false) }
    var providerName by remember { mutableStateOf("Dr Kadria Fairclough") }
    val timezone = remember { deviceTimeZoneId() }

    val todayIso = remember { todayIsoDate() }
    var weekStartIso by remember { mutableStateOf(todayIso) }
    var selectedDayIso by remember { mutableStateOf(todayIso) }
    var weekSlots by remember { mutableStateOf<List<AvailabilitySlot>>(emptyList()) }
    var selectedSlot by remember { mutableStateOf<String?>(null) }

    var loading by remember { mutableStateOf(true) }
    var slotsLoading by remember { mutableStateOf(false) }
    var booking by remember { mutableStateOf(false) }
    var bookSuccess by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val weekDays = remember(weekStartIso) { (0..6).map { addDaysIso(weekStartIso, it) } }
    val daySlots = remember(weekSlots, selectedDayIso) {
        weekSlots
            .mapNotNull { it.startTime }
            .filter { instantToLocalDateIso(it) == selectedDayIso }
            .sorted()
    }

    fun loadWeekSlots() {
        val uri = selectedType?.eventTypeUri ?: return
        scope.launch {
            slotsLoading = true
            selectedSlot = null
            runCatching {
                val start = localDateStartInstantIso(weekStartIso)
                val end = localDateStartInstantIso(addDaysIso(weekStartIso, 7))
                AppContainer.appointmentRepository.availability(uri, start, end)
            }.onSuccess { res ->
                weekSlots = res.slots
                error = null
            }.onFailure {
                weekSlots = emptyList()
                error = it.message
            }
            slotsLoading = false
        }
    }

    fun loadTypes() {
        scope.launch {
            loading = true
            runCatching { AppContainer.appointmentRepository.bookable() }
                .onSuccess { res ->
                    types = res.types.filter { !it.eventTypeUri.isNullOrBlank() }
                    providerName = res.providerName ?: "Dr Kadria Fairclough"
                    selectedType = when {
                        types.size == 1 -> types.first()
                        selectedType != null &&
                            types.any { it.eventTypeUri == selectedType?.eventTypeUri } -> selectedType
                        else -> null
                    }
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { loadTypes() }
    LaunchedEffect(selectedType?.eventTypeUri, weekStartIso) {
        if (selectedType?.eventTypeUri != null) loadWeekSlots()
    }
    LaunchedEffect(bookSuccess) {
        if (bookSuccess) {
            delay(1500)
            onBack()
        }
    }

    LukariaScaffold(title = title, onBack = onBack) {
        if (bookSuccess) {
            SectionTitle("Booking confirmed")
            BodyCopy(
                if (forUserId != null) "Appointment booked for this patient."
                else "Appointment booked. Returning…",
            )
            return@LukariaScaffold
        }

        if (loading && types.isEmpty()) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Available times")
        BodyCopy(
            if (forUserId != null) {
                "Choose an appointment type and time for this patient with $providerName."
            } else {
                "Choose an appointment type and a time for your visit with $providerName. " +
                    "Your menu stays available so you can leave anytime."
            },
        )

        if (types.isEmpty() && !loading) {
            BodyCopy(
                "No bookable appointment types are configured yet. Ask your clinic to import " +
                    "Calendly types in System Settings → Calendar.",
            )
        } else {
            SectionTitle("Appointment type")
            ExposedDropdownMenuBox(
                expanded = typeMenuOpen,
                onExpandedChange = { typeMenuOpen = it },
            ) {
                OutlinedTextField(
                    value = selectedType?.let { type ->
                        buildString {
                            append(type.name ?: "Type")
                            type.durationMinutes?.let { append(" ($it min)") }
                        }
                    }.orEmpty(),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Type") },
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
                            text = {
                                Text(
                                    buildString {
                                        append(t.name ?: t.id ?: "Type")
                                        t.durationMinutes?.let { append(" ($it min)") }
                                    },
                                )
                            },
                            onClick = {
                                selectedType = t
                                typeMenuOpen = false
                                selectedSlot = null
                            },
                        )
                    }
                }
            }
            BodyCopy("Provider: $providerName")

            if (selectedType == null) {
                BodyCopy("Select an appointment type to see available times.")
            } else {
                SectionTitle("Week")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TextButton(
                        onClick = {
                            val prev = addDaysIso(weekStartIso, -7)
                            val clamped = if (prev < todayIso) todayIso else prev
                            weekStartIso = clamped
                            selectedDayIso = clamped
                        },
                        enabled = weekStartIso > todayIso && !slotsLoading,
                    ) { Text("Previous") }
                    Text("${formatDayChip(weekStartIso)} – ${formatDayChip(addDaysIso(weekStartIso, 6))}")
                    TextButton(
                        onClick = {
                            val next = addDaysIso(weekStartIso, 7)
                            weekStartIso = next
                            selectedDayIso = next
                        },
                        enabled = !slotsLoading,
                    ) { Text("Next") }
                }

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    weekDays.forEach { day ->
                        val count = weekSlots.count { slot ->
                            slot.startTime?.let { instantToLocalDateIso(it) == day } == true
                        }
                        val past = day < todayIso
                        FilterChip(
                            selected = day == selectedDayIso,
                            enabled = !past,
                            onClick = {
                                selectedDayIso = day
                                selectedSlot = null
                            },
                            label = {
                                Text(
                                    buildString {
                                        append(formatDayChip(day))
                                        if (count > 0) append(" ($count)")
                                    },
                                )
                            },
                        )
                    }
                }

                SectionTitle("Times for ${formatDayChip(selectedDayIso)}")
                BodyCopy("Timezone: $timezone")
                if (slotsLoading) {
                    LoadingBlock("Loading times…")
                } else if (daySlots.isEmpty()) {
                    BodyCopy("No open times on this day. Try another day.")
                } else {
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        daySlots.forEach { slot ->
                            FilterChip(
                                selected = selectedSlot == slot,
                                onClick = { selectedSlot = slot },
                                label = { Text(formatInstantLocalTime(slot)) },
                            )
                        }
                    }
                }

                selectedSlot?.let { slot ->
                    BodyCopy(
                        "Selected: ${formatDayChip(selectedDayIso)} ${formatInstantLocalTime(slot)}" +
                            (selectedType?.name?.let { " · $it" } ?: ""),
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
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
                                        timezone = timezone,
                                        forUserId = forUserId,
                                    )
                                }.onSuccess {
                                    bookSuccess = true
                                    message = "Appointment booked"
                                    selectedSlot = null
                                }.onFailure { error = it.message }
                                booking = false
                            }
                        },
                        enabled = selectedType != null && selectedSlot != null && !booking,
                        modifier = Modifier.weight(1f),
                    ) { Text(if (booking) "Booking…" else "Confirm appointment") }
                    OutlinedButton(
                        onClick = { loadWeekSlots() },
                        enabled = !slotsLoading,
                    ) { Text("Refresh times") }
                }
            }
        }

        if (forUserId == null) {
            SectionTitle("Need to change an appointment?")
            BodyCopy(
                "To reschedule or cancel, use the link in your Calendly appointment confirmation email. " +
                    "That email also has options to add the visit to your calendar.",
            )
        }
    }
}

private fun addDaysIso(iso: String, delta: Int): String {
    var result = iso
    if (delta >= 0) {
        repeat(delta) { result = nextIsoDay(result) }
    } else {
        repeat(-delta) { result = prevIsoDay(result) }
    }
    return result
}

private fun nextIsoDay(iso: String): String {
    val parts = iso.split("-").mapNotNull { it.toIntOrNull() }
    if (parts.size != 3) return iso
    val y = parts[0]
    val m = parts[1]
    val d = parts[2]
    val daysInMonth = daysInMonth(y, m)
    val (ny, nm, nd) = when {
        d < daysInMonth -> Triple(y, m, d + 1)
        m < 12 -> Triple(y, m + 1, 1)
        else -> Triple(y + 1, 1, 1)
    }
    return formatIso(ny, nm, nd)
}

private fun prevIsoDay(iso: String): String {
    val parts = iso.split("-").mapNotNull { it.toIntOrNull() }
    if (parts.size != 3) return iso
    val y = parts[0]
    val m = parts[1]
    val d = parts[2]
    val (ny, nm, nd) = when {
        d > 1 -> Triple(y, m, d - 1)
        m > 1 -> Triple(y, m - 1, daysInMonth(y, m - 1))
        else -> Triple(y - 1, 12, 31)
    }
    return formatIso(ny, nm, nd)
}

private fun daysInMonth(y: Int, m: Int): Int = when (m) {
    1, 3, 5, 7, 8, 10, 12 -> 31
    4, 6, 9, 11 -> 30
    2 -> if (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0)) 29 else 28
    else -> 30
}

private fun formatIso(y: Int, m: Int, d: Int): String =
    "${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}"

private fun formatDayChip(iso: String): String {
    val parts = iso.split("-").mapNotNull { it.toIntOrNull() }
    if (parts.size != 3) return iso
    val months = listOf(
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    )
    val weekdays = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
    val y = parts[0]
    val m = parts[1]
    val d = parts[2]
    val t = intArrayOf(0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4)
    var yy = y
    if (m < 3) yy -= 1
    val dow = (yy + yy / 4 - yy / 100 + yy / 400 + t[m - 1] + d) % 7
    return "${weekdays[dow]}, ${months[m - 1]} $d"
}
