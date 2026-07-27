package com.lukariagroup.app.ui.screens.admin

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
        BodyCopy("Configure Microsoft 365 and Gmail for clinic outbound mail.")

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
