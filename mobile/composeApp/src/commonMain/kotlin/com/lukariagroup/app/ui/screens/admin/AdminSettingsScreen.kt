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
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.core.openExternalUrl
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

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

    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.adminRepository.fetchAdminSettings() }
                .onSuccess { data ->
                    status = data
                    data["microsoft"]?.jsonObject?.get("config")?.jsonObject?.let { cfg ->
                        msTenantId = cfg["tenantId"]?.jsonPrimitive?.contentOrNull ?: "common"
                        msClientId = cfg["clientId"]?.jsonPrimitive?.contentOrNull.orEmpty()
                        msClientSecret = cfg["clientSecret"]?.jsonPrimitive?.contentOrNull.orEmpty()
                    }
                    data["google"]?.jsonObject?.get("config")?.jsonObject?.let { cfg ->
                        gClientId = cfg["clientId"]?.jsonPrimitive?.contentOrNull.orEmpty()
                        gClientSecret = cfg["clientSecret"]?.jsonPrimitive?.contentOrNull.orEmpty()
                    }
                    error = null
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
                        calendarApiToken = ""
                    }
                }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    val microsoft = status?.get("microsoft")?.jsonObject
    val google = status?.get("google")?.jsonObject
    val connectUrls = status?.get("connectUrls")?.jsonObject
    val msConnected = microsoft?.get("connected")?.jsonPrimitive?.booleanOrNull == true
    val gConnected = google?.get("connected")?.jsonPrimitive?.booleanOrNull == true
    val msEmail = microsoft?.get("email")?.jsonPrimitive?.contentOrNull
    val gEmail = google?.get("email")?.jsonPrimitive?.contentOrNull
    val msAuthUrl = connectUrls?.get("microsoftAuth")?.jsonPrimitive?.contentOrNull
    val gAuthUrl = connectUrls?.get("googleAuth")?.jsonPrimitive?.contentOrNull

    LukariaScaffold(title = "System Settings", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }
        BodyCopy("Configure calendar booking and clinic outbound mail (Microsoft 365 / Gmail).")

        SectionTitle("Calendar")
        BodyCopy("Public booking URL for marketing CTAs and the Schedule Calendly button.")
        Switch(checked = calendarEnabled, onCheckedChange = { calendarEnabled = it })
        BodyCopy(if (calendarEnabled) "Site-wide booking link enabled" else "Using default fallback URL when disabled")
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

        SectionTitle("Microsoft / M365")
        BodyCopy(if (msConnected) "Connected: ${msEmail ?: "—"}" else "Not linked")
        OutlinedTextField(msTenantId, { msTenantId = it }, label = { Text("Tenant ID") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(msClientId, { msClientId = it }, label = { Text("Client ID") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(msClientSecret, { msClientSecret = it }, label = { Text("Client Secret") }, modifier = Modifier.fillMaxWidth())
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
                                    "${com.lukariagroup.app.core.PlatformConfig.apiBaseUrl.trimEnd('/')}/api/admin/microsoft/callback",
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
            OutlinedTextField(testEmail, { testEmail = it }, label = { Text("Test recipient") }, modifier = Modifier.fillMaxWidth())
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
        OutlinedTextField(gClientId, { gClientId = it }, label = { Text("Client ID") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(gClientSecret, { gClientSecret = it }, label = { Text("Client Secret") }, modifier = Modifier.fillMaxWidth())
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
                                    "${com.lukariagroup.app.core.PlatformConfig.apiBaseUrl.trimEnd('/')}/api/admin/google/callback",
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
            OutlinedTextField(testEmail, { testEmail = it }, label = { Text("Test recipient") }, modifier = Modifier.fillMaxWidth())
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
