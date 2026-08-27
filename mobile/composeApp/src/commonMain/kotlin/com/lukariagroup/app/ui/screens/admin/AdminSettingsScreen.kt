package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
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
import com.lukariagroup.app.data.models.CalendarAppointmentType
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.core.openExternalUrl
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.put

/** Safe cast — JsonNull is not Kotlin null, so `.jsonObject` would throw. */
private fun JsonElement?.asObjectOrNull(): JsonObject? = this as? JsonObject

private fun JsonObject?.stringOrNull(key: String): String? =
    (this?.get(key) as? JsonPrimitive)?.contentOrNull

private fun JsonObject?.booleanOrFalse(key: String): Boolean =
    (this?.get(key) as? JsonPrimitive)?.booleanOrNull == true

@Composable
fun AdminSettingsScreen(onBack: () -> Unit) {
    var status by remember { mutableStateOf<JsonObject?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }

    var msTenantId by remember { mutableStateOf("common") }
    var msClientId by remember { mutableStateOf("") }
    var msClientSecret by remember { mutableStateOf("") }
    var gClientId by remember { mutableStateOf("") }
    var gClientSecret by remember { mutableStateOf("") }
    var testEmail by remember { mutableStateOf("") }

    var calendarEnabled by remember { mutableStateOf(true) }
    var calendarProvider by remember { mutableStateOf("calendly") }
    var calendarBookingUrl by remember { mutableStateOf(PlatformConfig.calendlyBookingUrl) }
    var calendarEventTypeUrl by remember { mutableStateOf("") }
    var calendarBookingLabel by remember { mutableStateOf("Book an appointment") }
    var calendarApiToken by remember { mutableStateOf("") }
    var calendarHasApiToken by remember { mutableStateOf(false) }
    var calendarCanListEventTypes by remember { mutableStateOf(false) }
    var appointmentTypes by remember { mutableStateOf<List<CalendarAppointmentType>>(emptyList()) }
    var importingTypes by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            error = null
            runCatching { AppContainer.adminRepository.fetchAdminSettings() }
                .onSuccess { data ->
                    status = data
                    // API returns config: null when mail isn't linked — never use .jsonObject here.
                    data["microsoft"].asObjectOrNull()?.get("config").asObjectOrNull()?.let { cfg ->
                        msTenantId = cfg.stringOrNull("tenantId") ?: "common"
                        msClientId = cfg.stringOrNull("clientId").orEmpty()
                        msClientSecret = cfg.stringOrNull("clientSecret").orEmpty()
                    }
                    data["google"].asObjectOrNull()?.get("config").asObjectOrNull()?.let { cfg ->
                        gClientId = cfg.stringOrNull("clientId").orEmpty()
                        gClientSecret = cfg.stringOrNull("clientSecret").orEmpty()
                    }
                }
                .onFailure { error = it.message }
            runCatching { AppContainer.adminRepository.fetchCalendarSettings() }
                .onSuccess { res ->
                    res.config?.let { cfg ->
                        calendarEnabled = cfg.enabled
                        calendarProvider = cfg.provider ?: "calendly"
                        calendarBookingUrl = cfg.bookingUrl ?: PlatformConfig.calendlyBookingUrl
                        calendarEventTypeUrl = cfg.eventTypeUrl.orEmpty()
                        calendarBookingLabel = cfg.bookingLabel ?: "Book an appointment"
                        calendarHasApiToken = cfg.hasApiToken
                        calendarCanListEventTypes = cfg.canListEventTypes || cfg.hasApiToken || cfg.hasEnvToken
                        calendarApiToken = ""
                        appointmentTypes = cfg.appointmentTypes
                    }
                }
                .onFailure { err ->
                    if (error == null) error = err.message
                }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    val microsoft = status?.get("microsoft").asObjectOrNull()
    val google = status?.get("google").asObjectOrNull()
    val connectUrls = status?.get("connectUrls").asObjectOrNull()
    val msConnected = microsoft.booleanOrFalse("connected")
    val gConnected = google.booleanOrFalse("connected")
    val msEmail = microsoft.stringOrNull("email")
    val gEmail = google.stringOrNull("email")
    val msAuthUrl = connectUrls.stringOrNull("microsoftAuth")
    val gAuthUrl = connectUrls.stringOrNull("googleAuth")

    LukariaScaffold(title = "System Settings", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }
        BodyCopy("Configure calendar booking and clinic outbound mail (Microsoft 365 / Gmail).")

        SectionTitle("Calendar")
        BodyCopy("Public booking URL for marketing CTAs and the Schedule Calendly button.")
        Switch(checked = calendarEnabled, onCheckedChange = { calendarEnabled = it })
        BodyCopy(
            if (calendarEnabled) {
                "Site-wide booking link enabled"
            } else {
                "Using default fallback URL when disabled"
            },
        )
        OutlinedTextField(
            calendarProvider,
            { calendarProvider = it },
            label = { Text("Provider") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            calendarBookingUrl,
            { calendarBookingUrl = it },
            label = { Text("Booking URL") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            calendarEventTypeUrl,
            { calendarEventTypeUrl = it },
            label = { Text("Event type URL") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            calendarBookingLabel,
            { calendarBookingLabel = it },
            label = { Text("Button label") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            calendarApiToken,
            { calendarApiToken = it },
            label = {
                Text(
                    if (calendarHasApiToken) {
                        "API token (leave blank to keep)"
                    } else {
                        "API token (optional)"
                    },
                )
            },
            modifier = Modifier.fillMaxWidth(),
        )
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.adminRepository.saveCalendarSettings(
                            buildJsonObject {
                                put("provider", calendarProvider.ifBlank { "calendly" })
                                put("bookingUrl", calendarBookingUrl.trim())
                                put(
                                    "eventTypeUrl",
                                    calendarEventTypeUrl.ifBlank { calendarBookingUrl }.trim(),
                                )
                                put("bookingLabel", calendarBookingLabel.trim())
                                put("enabled", calendarEnabled)
                                put("apiToken", calendarApiToken)
                                putJsonArray("appointmentTypes") {
                                    appointmentTypes.forEach { type ->
                                        add(
                                            buildJsonObject {
                                                put("id", type.id ?: "")
                                                put("name", type.name ?: "")
                                                put("durationMinutes", type.durationMinutes ?: 30)
                                                put("eventTypeUrl", type.eventTypeUrl ?: "")
                                                put("eventTypeUri", type.eventTypeUri ?: "")
                                                put("enabled", type.enabled)
                                            },
                                        )
                                    }
                                }
                            },
                        )
                    }.onSuccess {
                        message = "Calendar settings saved"
                        refresh()
                    }.onFailure { error = it.message }
                }
            },
            enabled = calendarBookingUrl.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save Calendar Settings") }
        if (calendarBookingUrl.isNotBlank()) {
            OutlinedButton(
                onClick = { openExternalUrl(calendarBookingUrl) },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Open booking link") }
        }


        SectionTitle("Appointment types (Dr Fairclough)")
        BodyCopy(
            "Patients can book these Calendly event types in Schedule. Import from Calendly, turn off any you do not want bookable, then Save Calendar Settings.",
        )
        OutlinedButton(
            onClick = {
                scope.launch {
                    importingTypes = true
                    runCatching { AppContainer.adminRepository.fetchCalendlyEventTypes() }
                        .onSuccess { res ->
                            val active = res.eventTypes.filter { it.active }
                            if (active.isEmpty()) {
                                error = "Calendly returned no active event types"
                            } else {
                                val byUri = appointmentTypes.mapNotNull { t ->
                                    t.eventTypeUri?.let { it to t }
                                }.toMap()
                                val merged = appointmentTypes.toMutableList()
                                active.forEach { et ->
                                    val existing = et.uri?.let { byUri[it] }
                                    if (existing != null) {
                                        val idx = merged.indexOfFirst { it.id == existing.id }
                                        if (idx >= 0) {
                                            merged[idx] = existing.copy(
                                                name = et.name ?: existing.name,
                                                durationMinutes = et.duration ?: existing.durationMinutes,
                                                eventTypeUrl = et.schedulingUrl ?: existing.eventTypeUrl,
                                                eventTypeUri = et.uri ?: existing.eventTypeUri,
                                                enabled = true,
                                            )
                                        }
                                    } else {
                                        merged.add(
                                            CalendarAppointmentType(
                                                id = et.uri ?: "type-${merged.size + 1}",
                                                name = et.name ?: "Appointment",
                                                durationMinutes = et.duration ?: 30,
                                                eventTypeUrl = et.schedulingUrl,
                                                eventTypeUri = et.uri,
                                                enabled = true,
                                            ),
                                        )
                                    }
                                }
                                appointmentTypes = merged
                                message = "Loaded ${active.size} Calendly event type(s). Save to apply."
                            }
                        }
                        .onFailure { error = it.message }
                    importingTypes = false
                }
            },
            enabled = !importingTypes && calendarCanListEventTypes,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (importingTypes) "Importing…" else "Import from Calendly")
        }
        OutlinedButton(
            onClick = {
                appointmentTypes = appointmentTypes + CalendarAppointmentType(
                    id = "type-${appointmentTypes.size + 1}-${kotlin.random.Random.nextInt(100000, 999999)}",
                    name = "",
                    durationMinutes = 30,
                    eventTypeUrl = calendarEventTypeUrl.ifBlank { calendarBookingUrl },
                    eventTypeUri = "",
                    enabled = true,
                )
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Add appointment type") }
        appointmentTypes.forEachIndexed { index, type ->
            SectionTitle("Type ${index + 1}")
            Switch(
                checked = type.enabled,
                onCheckedChange = { enabled ->
                    appointmentTypes = appointmentTypes.toMutableList().also {
                        it[index] = type.copy(enabled = enabled)
                    }
                },
            )
            BodyCopy(if (type.enabled) "Bookable" else "Hidden from patients")
            OutlinedTextField(
                type.name.orEmpty(),
                { value ->
                    appointmentTypes = appointmentTypes.toMutableList().also {
                        it[index] = type.copy(name = value)
                    }
                },
                label = { Text("Name") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                (type.durationMinutes ?: 30).toString(),
                { value ->
                    appointmentTypes = appointmentTypes.toMutableList().also {
                        it[index] = type.copy(durationMinutes = value.toIntOrNull() ?: 30)
                    }
                },
                label = { Text("Duration (minutes)") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                type.eventTypeUrl.orEmpty(),
                { value ->
                    appointmentTypes = appointmentTypes.toMutableList().also {
                        it[index] = type.copy(eventTypeUrl = value)
                    }
                },
                label = { Text("Event type URL") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                type.eventTypeUri.orEmpty(),
                { value ->
                    appointmentTypes = appointmentTypes.toMutableList().also {
                        it[index] = type.copy(eventTypeUri = value)
                    }
                },
                label = { Text("Event Type API URI") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedButton(
                onClick = {
                    appointmentTypes = appointmentTypes.filterIndexed { i, _ -> i != index }
                },
                enabled = appointmentTypes.size > 1,
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Remove type") }
        }

        SectionTitle("Microsoft / M365")
        BodyCopy(if (msConnected) "Connected: ${msEmail ?: "—"}" else "Not linked")
        OutlinedTextField(
            msTenantId,
            { msTenantId = it },
            label = { Text("Tenant ID") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            msClientId,
            { msClientId = it },
            label = { Text("Client ID") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            msClientSecret,
            { msClientSecret = it },
            label = { Text("Client Secret") },
            modifier = Modifier.fillMaxWidth(),
        )
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.adminRepository.saveAdminSettingsConfig(
                            type = "microsoft",
                            config = buildJsonObject {
                                put("clientId", msClientId)
                                put("clientSecret", msClientSecret)
                                put("tenantId", msTenantId)
                                put(
                                    "redirectUri",
                                    "${PlatformConfig.apiBaseUrl.trimEnd('/')}/api/admin/microsoft/callback",
                                )
                            },
                        )
                    }.onSuccess {
                        message = "Microsoft configuration saved"
                        refresh()
                    }.onFailure { error = it.message }
                }
            },
            enabled = msClientId.isNotBlank() && msClientSecret.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save Microsoft Config") }
        if (!msAuthUrl.isNullOrBlank()) {
            OutlinedButton(
                onClick = { openExternalUrl(msAuthUrl) },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (msConnected) "Re-authorize Microsoft" else "Authorize Microsoft") }
        }
        if (msConnected) {
            OutlinedTextField(
                testEmail,
                { testEmail = it },
                label = { Text("Test recipient") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedButton(
                onClick = {
                    scope.launch {
                        runCatching { AppContainer.adminRepository.sendMicrosoftTestEmail(testEmail) }
                            .onSuccess { message = "Microsoft test email sent" }
                            .onFailure { error = it.message }
                    }
                },
                enabled = testEmail.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Send Microsoft Test Email") }
        }

        SectionTitle("Google / Gmail")
        BodyCopy(if (gConnected) "Connected: ${gEmail ?: "—"}" else "Not linked")
        OutlinedTextField(
            gClientId,
            { gClientId = it },
            label = { Text("Client ID") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            gClientSecret,
            { gClientSecret = it },
            label = { Text("Client Secret") },
            modifier = Modifier.fillMaxWidth(),
        )
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.adminRepository.saveAdminSettingsConfig(
                            type = "google",
                            config = buildJsonObject {
                                put("clientId", gClientId)
                                put("clientSecret", gClientSecret)
                                put(
                                    "redirectUri",
                                    "${PlatformConfig.apiBaseUrl.trimEnd('/')}/api/admin/google/callback",
                                )
                            },
                        )
                    }.onSuccess {
                        message = "Google configuration saved"
                        refresh()
                    }.onFailure { error = it.message }
                }
            },
            enabled = gClientId.isNotBlank() && gClientSecret.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save Google Config") }
        if (!gAuthUrl.isNullOrBlank()) {
            OutlinedButton(
                onClick = { openExternalUrl(gAuthUrl) },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (gConnected) "Re-authorize Google" else "Authorize Google") }
        }
        if (gConnected) {
            OutlinedTextField(
                testEmail,
                { testEmail = it },
                label = { Text("Test recipient") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedButton(
                onClick = {
                    scope.launch {
                        runCatching { AppContainer.adminRepository.sendGoogleTestEmail(testEmail) }
                            .onSuccess { message = "Google test email sent" }
                            .onFailure { error = it.message }
                    }
                },
                enabled = testEmail.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Send Google Test Email") }
        }
    }
}
