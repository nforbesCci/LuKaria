package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
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
import com.lukariagroup.app.data.consent.ConsentFormContent
import com.lukariagroup.app.data.models.ConsentPayload
import com.lukariagroup.app.data.models.ConsentType
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.components.SignaturePad
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConsentFormsScreen(onBack: () -> Unit) {
    var enabledForms by remember { mutableStateOf<List<ConsentType>>(emptyList()) }
    var selected by remember { mutableStateOf<ConsentType?>(null) }
    var loadingList by remember { mutableStateOf(true) }
    var dropdownExpanded by remember { mutableStateOf(false) }

    var patientName by remember { mutableStateOf("") }
    var patientDOB by remember { mutableStateOf("") }
    var consentDate by remember { mutableStateOf("") }
    var signatureUrl by remember { mutableStateOf<String?>(null) }
    var locked by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loadingForm by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        loadingList = true
        runCatching { AppContainer.consentRepository.fetchAll() }
            .onSuccess { all ->
                val enabled = ConsentType.entries.filter { type ->
                    val resp = all[type]
                    resp != null && resp.success && resp.record?.available == true
                }
                enabledForms = enabled
                if (selected == null || selected !in enabled) {
                    selected = enabled.firstOrNull()
                }
                error = null
            }
            .onFailure { error = it.message }
        loadingList = false
    }

    LaunchedEffect(selected) {
        val type = selected ?: return@LaunchedEffect
        loadingForm = true
        signatureUrl = null
        runCatching { AppContainer.consentRepository.fetch(type) }
            .onSuccess { resp ->
                val record = resp.record
                patientName = record?.patientName ?: record?.fullName.orEmpty()
                patientDOB = record?.patientDOB.orEmpty()
                consentDate = record?.consentDate.orEmpty()
                signatureUrl = record?.signature ?: record?.signatureDataUrl
                locked = record?.locked == true || record?.complete == true
                status = when {
                    record?.complete == true -> "This form is signed and locked."
                    !signatureUrl.isNullOrBlank() -> "Draft with signature loaded — you can update and save."
                    else -> "Review the consent text, fill your details, and sign below."
                }
                error = null
            }
            .onFailure { error = it.message }
        loadingForm = false
    }

    LukariaScaffold(title = "Consent forms", onBack = onBack) {
        when {
            loadingList -> LoadingBlock("Loading available consents…")
            enabledForms.isEmpty() -> {
                BodyCopy(
                    "No consent forms are enabled for your account yet. Ask your clinic to unlock the forms you need.",
                )
                ErrorText(error)
            }
            else -> {
                SectionTitle("Select form")
                ExposedDropdownMenuBox(
                    expanded = dropdownExpanded,
                    onExpandedChange = { dropdownExpanded = it },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    OutlinedTextField(
                        value = selected?.displayName.orEmpty(),
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Enabled consent form") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdownExpanded) },
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth(),
                    )
                    ExposedDropdownMenu(
                        expanded = dropdownExpanded,
                        onDismissRequest = { dropdownExpanded = false },
                    ) {
                        enabledForms.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.displayName) },
                                onClick = {
                                    selected = type
                                    dropdownExpanded = false
                                },
                            )
                        }
                    }
                }

                selected?.let { type ->
                    if (loadingForm) {
                        LoadingBlock("Loading form…")
                    } else {
                        SectionTitle("Consent text")
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 160.dp, max = 320.dp)
                                .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                                .verticalScroll(rememberScrollState()),
                        ) {
                            Text(
                                text = ConsentFormContent.textFor(type),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface,
                            )
                        }

                        SectionTitle("Your details")
                        OutlinedTextField(
                            value = patientName,
                            onValueChange = { patientName = it },
                            label = { Text("Patient name") },
                            enabled = !locked,
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = patientDOB,
                            onValueChange = { patientDOB = it },
                            label = { Text("Date of birth (YYYY-MM-DD)") },
                            enabled = !locked,
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = consentDate,
                            onValueChange = { consentDate = it },
                            label = { Text("Consent date (YYYY-MM-DD)") },
                            enabled = !locked,
                            modifier = Modifier.fillMaxWidth(),
                        )

                        SectionTitle("Signature")
                        if (locked) {
                            BodyCopy(
                                if (!signatureUrl.isNullOrBlank()) {
                                    "Signature on file. This consent is complete and cannot be edited."
                                } else {
                                    "This consent is locked."
                                },
                            )
                        } else {
                            SignaturePad(
                                modifier = Modifier.fillMaxWidth(),
                                autoCommit = true,
                                onSigned = { signatureUrl = it },
                                onCleared = { signatureUrl = null },
                            )
                            BodyCopy(
                                if (!signatureUrl.isNullOrBlank()) {
                                    "Signature captured. You can clear and resign if needed."
                                } else {
                                    "Draw your signature in the box. It is saved automatically when you lift your finger."
                                },
                            )
                        }

                        ErrorText(error)
                        status?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }

                        Button(
                            onClick = {
                                scope.launch {
                                    saving = true
                                    runCatching {
                                        AppContainer.consentRepository.save(
                                            type,
                                            ConsentPayload(
                                                patientName = patientName,
                                                patientDOB = patientDOB,
                                                consentDate = consentDate,
                                                signature = signatureUrl,
                                                signatureDataUrl = signatureUrl,
                                                complete = false,
                                            ),
                                        )
                                    }.onSuccess {
                                        status = "Draft saved — ${type.displayName}"
                                        error = null
                                    }.onFailure { error = it.message }
                                    saving = false
                                }
                            },
                            enabled = !locked && !saving && patientName.isNotBlank(),
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text(if (saving) "Saving…" else "Save draft") }

                        Button(
                            onClick = {
                                scope.launch {
                                    saving = true
                                    runCatching {
                                        AppContainer.consentRepository.save(
                                            type,
                                            ConsentPayload(
                                                patientName = patientName,
                                                patientDOB = patientDOB,
                                                consentDate = consentDate,
                                                signature = signatureUrl,
                                                signatureDataUrl = signatureUrl,
                                                complete = true,
                                                acknowledged = true,
                                            ),
                                        )
                                    }.onSuccess {
                                        status = "Signed and completed — ${type.displayName}"
                                        locked = true
                                        error = null
                                    }.onFailure { error = it.message }
                                    saving = false
                                }
                            },
                            enabled = !locked &&
                                !saving &&
                                patientName.isNotBlank() &&
                                patientDOB.isNotBlank() &&
                                consentDate.isNotBlank() &&
                                !signatureUrl.isNullOrBlank(),
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text("Sign & complete") }
                    }
                }
            }
        }
    }
}
