package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
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
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray

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
    var panel by remember { mutableStateOf("CMP, Lipid, A1c") }
    var tests by remember { mutableStateOf("") }
    var diagnosis by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var prefilling by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

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
        prefilling = false
    }

    LukariaScaffold(title = "Lab requisition", onBack = onBack) {
        SectionTitle("Patient")
        BodyCopy("Builds PDF on the server (/api/pdf/lab-requisition) then uploads to SharePoint and emails.")
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

        SectionTitle("Order")
        OutlinedTextField(panel, { panel = it }, label = { Text("Panels (comma-separated)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(tests, { tests = it }, label = { Text("Additional tests") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(diagnosis, { diagnosis = it }, label = { Text("Diagnosis / ICD") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(notes, { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth())

        ErrorText(error)
        message?.let { Text(it) }
        Button(
            onClick = {
                scope.launch {
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
                                put("panel", panel)
                                put("diagnosis", diagnosis)
                                put("notes", notes)
                                putJsonArray("tests") {
                                    tests.split(',').map { it.trim() }.filter { it.isNotEmpty() }
                                        .forEach { add(kotlinx.serialization.json.JsonPrimitive(it)) }
                                }
                            },
                        )
                    }.onSuccess {
                        message = "Lab PDF request sent"
                        error = null
                    }.onFailure { error = it.message }
                }
            },
            enabled = email.isNotBlank() && patientName.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Generate & send lab requisition") }
    }
}
