package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.LabRequisitionCatalog
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LabRequisitionScreen(
    onBack: () -> Unit,
    userId: String? = null,
) {
    var patientUserId by remember { mutableStateOf(userId.orEmpty()) }
    var patientName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var clinicalInfo by remember { mutableStateOf("") }
    var diagnosis by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var urgency by remember { mutableStateOf("Routine") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var prefilling by remember { mutableStateOf(false) }
    var sending by remember { mutableStateOf(false) }
    val selected = remember { mutableStateMapOf<String, Boolean>() }
    val scope = rememberCoroutineScope()

    fun selectionKey(sectionId: String, test: String) = "$sectionId::$test"

    fun applyWeightLossPreset() {
        LabRequisitionCatalog.weightLossPreset.forEach { (sectionId, tests) ->
            tests.forEach { test ->
                selected[selectionKey(sectionId, test)] = true
            }
        }
    }

    fun selectedTests(): List<String> =
        LabRequisitionCatalog.sections.flatMap { section ->
            section.tests.filter { selected[selectionKey(section.id, it)] == true }
                .map { "${section.title}: $it" }
        }

    LaunchedEffect(userId) {
        val id = userId?.takeIf { it.isNotBlank() } ?: return@LaunchedEffect
        prefilling = true
        patientUserId = id
        runCatching { AppContainer.adminRepository.fetchProfile(id) }
            .onSuccess { resp ->
                val p = resp.profile
                patientName = p?.name.orEmpty()
                email = (p?.userEmail ?: p?.email).orEmpty()
                dob = p?.dateOfBirth.orEmpty()
                sex = (p?.sex ?: p?.gender).orEmpty()
                phone = p?.phone.orEmpty()
                address = listOfNotNull(p?.address, p?.city, p?.parish, p?.state, p?.zip)
                    .filter { it.isNotBlank() }
                    .joinToString(", ")
                error = null
            }
            .onFailure { error = it.message }
        if (email.isBlank() || patientName.isBlank()) {
            runCatching { AppContainer.adminRepository.fetchAuth0User(id) }
                .onSuccess { resp ->
                    val u = resp.user
                    if (u != null) {
                        if (email.isBlank()) email = u.email.orEmpty()
                        if (patientName.isBlank()) patientName = u.name.orEmpty()
                    }
                }
        }
        prefilling = false
    }

    LukariaScaffold(title = "Lab requisition", onBack = onBack) {
        SectionTitle("Patient")
        BodyCopy(
            "Same test checklist as the web lab requisition. " +
                "Generate & send builds a PDF, uploads to SharePoint, and emails the patient.",
        )
        if (prefilling) BodyCopy("Loading patient profile…")
        OutlinedTextField(
            patientUserId,
            { patientUserId = it },
            label = { Text("Patient userId") },
            modifier = Modifier.fillMaxWidth(),
            enabled = userId.isNullOrBlank(),
        )
        OutlinedTextField(patientName, { patientName = it }, label = { Text("Patient name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(email, { email = it }, label = { Text("Patient email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(dob, { dob = it }, label = { Text("DOB") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(sex, { sex = it }, label = { Text("Sex") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(address, { address = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth())

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedButton(onClick = { applyWeightLossPreset() }) {
                Text("Weight Loss Tests")
            }
            OutlinedButton(onClick = { selected.clear() }) {
                Text("Clear tests")
            }
        }

        LabRequisitionCatalog.sections.forEach { section ->
            SectionTitle(section.title)
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp),
            ) {
                section.tests.forEach { test ->
                    val key = selectionKey(section.id, test)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(
                            checked = selected[key] == true,
                            onCheckedChange = { checked -> selected[key] = checked },
                        )
                        Text(test, modifier = Modifier.padding(end = 8.dp))
                    }
                }
            }
        }

        SectionTitle("Clinical")
        OutlinedTextField(
            clinicalInfo,
            { clinicalInfo = it },
            label = { Text("Clinical information") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )
        OutlinedTextField(diagnosis, { diagnosis = it }, label = { Text("Diagnosis / ICD") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(notes, { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth())

        SectionTitle("Urgency")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Routine", "Urgent", "STAT").forEach { option ->
                FilterChip(
                    selected = urgency == option,
                    onClick = { urgency = option },
                    label = { Text(option) },
                )
            }
        }

        val chosen = selectedTests()
        if (chosen.isNotEmpty()) {
            BodyCopy("${chosen.size} test(s) selected")
        }

        ErrorText(error)
        message?.let { Text(it) }
        Button(
            onClick = {
                scope.launch {
                    sending = true
                    val tests = selectedTests()
                    runCatching {
                        AppContainer.adminRepository.sendLabPdf(
                            buildJsonObject {
                                put("userId", patientUserId)
                                put("patientName", patientName)
                                put("patientEmail", email)
                                put("patientDOB", dob)
                                put("patientSex", sex)
                                put("patientPhone", phone)
                                put("patientAddress", address)
                                put("diagnosis", diagnosis)
                                put("notes", buildString {
                                    append(notes)
                                    if (clinicalInfo.isNotBlank()) {
                                        if (isNotEmpty()) append("\n")
                                        append("Clinical: ").append(clinicalInfo)
                                    }
                                    if (isNotEmpty()) append("\n")
                                    append("Urgency: ").append(urgency)
                                })
                                put("panel", tests.joinToString(", ").ifBlank { "—" })
                                putJsonArray("tests") {
                                    tests.forEach { add(JsonPrimitive(it)) }
                                }
                            },
                        )
                    }.onSuccess {
                        message = "Lab PDF uploaded and emailed"
                        error = null
                    }.onFailure { error = it.message }
                    sending = false
                }
            },
            enabled = !sending && email.isNotBlank() && patientName.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (sending) "Sending…" else "Generate & send lab requisition") }
    }
}
