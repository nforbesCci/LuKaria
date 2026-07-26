package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
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
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.consent.ConsentFormContent
import com.lukariagroup.app.data.models.ConsentType
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun AdminConsentFormsScreen(userId: String, onBack: () -> Unit) {
    var consents by remember { mutableStateOf<JsonObject?>(null) }
    var patientName by remember { mutableStateOf(userId) }
    var viewing by remember { mutableStateOf<ConsentType?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching {
                val c = AppContainer.adminRepository.fetchConsentForms(userId)
                val p = AppContainer.adminRepository.fetchProfile(userId)
                c to p
            }.onSuccess { (c, p) ->
                consents = c["consentForms"]?.jsonObject ?: c
                patientName = p.profile?.name ?: userId
                error = null
            }.onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(userId) { refresh() }

    val viewingType = viewing
    if (viewingType != null) {
        val form = consents?.get(viewingType.pathSegment)?.jsonObject
        AdminConsentViewerScreen(
            type = viewingType,
            form = form,
            onBack = { viewing = null },
        )
        return
    }

    LukariaScaffold(title = "Consent Forms", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        AdminGeneratePdfButton(
            title = "Consent Forms",
            patientName = patientName,
            sections = {
                ConsentType.entries.map { type ->
                    val form = consents?.get(type.pathSegment)?.jsonObject
                    val available = form?.get("available")?.jsonPrimitive?.booleanOrNull == true
                    val locked = form?.get("locked")?.jsonPrimitive?.booleanOrNull == true
                    val complete = form?.get("complete")?.jsonPrimitive?.booleanOrNull == true
                    val status = when {
                        complete -> "Complete"
                        locked -> "Locked"
                        available -> "Available"
                        else -> "Unavailable"
                    }
                    AdminPdfSection(type.displayName, status)
                }
            },
        )

        ConsentType.entries.forEach { type ->
            val form = consents?.get(type.pathSegment)?.jsonObject
            val available = form?.get("available")?.jsonPrimitive?.booleanOrNull == true
            val locked = form?.get("locked")?.jsonPrimitive?.booleanOrNull == true
            val complete = form?.get("complete")?.jsonPrimitive?.booleanOrNull == true
            val status = when {
                complete -> "Complete"
                locked -> "Locked"
                available -> "Available"
                else -> "Unavailable"
            }

            SectionTitle(type.displayName)
            BodyCopy("Status: $status")
            OutlinedButton(
                onClick = { viewing = type },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("View") }
            Button(
                onClick = {
                    scope.launch {
                        runCatching {
                            AppContainer.adminRepository.updateConsentForm(
                                userId = userId,
                                formType = type.pathSegment,
                                enabled = !available,
                            )
                        }.onSuccess {
                            message = if (available) "Disabled ${type.displayName}" else "Enabled ${type.displayName}"
                            refresh()
                        }.onFailure { error = it.message }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (available) "Disable" else "Enable") }
            OutlinedButton(
                onClick = {
                    scope.launch {
                        runCatching {
                            AppContainer.adminRepository.updateConsentForm(
                                userId = userId,
                                formType = type.pathSegment,
                                locked = !locked,
                            )
                        }.onSuccess {
                            message = if (locked) "Unlocked ${type.displayName}" else "Locked ${type.displayName}"
                            refresh()
                        }.onFailure { error = it.message }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (locked) "Unlock" else "Lock") }
        }
    }
}

@Composable
fun AdminConsentViewerScreen(
    type: ConsentType,
    form: JsonObject?,
    onBack: () -> Unit,
) {
    val complete = form?.get("complete")?.jsonPrimitive?.booleanOrNull == true
    val locked = form?.get("locked")?.jsonPrimitive?.booleanOrNull == true
    val available = form?.get("available")?.jsonPrimitive?.booleanOrNull == true
    val signedName = form?.get("signedName")?.jsonPrimitive?.contentOrNull
        ?: form?.get("patientName")?.jsonPrimitive?.contentOrNull
        ?: form?.get("name")?.jsonPrimitive?.contentOrNull
    val signedDate = form?.get("signedDate")?.jsonPrimitive?.contentOrNull
        ?: form?.get("completedAt")?.jsonPrimitive?.contentOrNull
        ?: form?.get("date")?.jsonPrimitive?.contentOrNull
    val hasSignature = form?.get("signature") != null ||
        form?.get("signatureData") != null ||
        form?.get("hasSignature")?.jsonPrimitive?.booleanOrNull == true

    LukariaScaffold(title = type.displayName, onBack = onBack) {
        BodyCopy(
            buildString {
                append(when {
                    complete -> "Complete"
                    locked -> "Locked"
                    available -> "Available"
                    else -> "Unavailable"
                })
                if (signedName != null) append(" · Signed by $signedName")
                if (signedDate != null) append(" · $signedDate")
                append(if (hasSignature) " · Signature on file" else " · No signature on file")
            },
        )
        SectionTitle("Consent document")
        Text(ConsentFormContent.textFor(type))
    }
}
