package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private val jamaicaParishes = listOf(
    "Kingston",
    "St. Andrew",
    "St. Thomas",
    "Portland",
    "St. Mary",
    "St. Ann",
    "Trelawny",
    "St. James",
    "Hanover",
    "Westmoreland",
    "St. Elizabeth",
    "Manchester",
    "Clarendon",
    "St. Catherine",
)

private val medicalConditionsList = listOf(
    "Hypertension",
    "Diabetes",
    "Obesity",
    "High Cholesterol",
    "Sleep Apnea",
    "Kidney Disease",
    "Thyroid Disease",
    "None of the above",
    "Other",
)

private val sexOptions = listOf(
    "male" to "Male",
    "female" to "Female",
    "other" to "Other",
)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ProfileWizardScreen(onBack: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var dateOfBirth by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var parish by remember { mutableStateOf("") }
    var parishMenuOpen by remember { mutableStateOf(false) }

    var nextOfKinName by remember { mutableStateOf("") }
    var nextOfKinPhone by remember { mutableStateOf("") }
    var nextOfKinRelationship by remember { mutableStateOf("") }

    var selectedConditions by remember { mutableStateOf<Set<String>>(emptySet()) }
    var otherMedicalCondition by remember { mutableStateOf("") }
    var currentMedications by remember { mutableStateOf("") }
    var hasAllergies by remember { mutableStateOf(false) }
    var allergicMedications by remember { mutableStateOf("") }

    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun applyProfile(profile: PatientProfile) {
        name = profile.name.orEmpty()
        email = profile.preferredEmail ?: profile.userEmail ?: profile.email.orEmpty()
        phone = profile.preferredPhone ?: profile.phone.orEmpty()
        dateOfBirth = profile.dateOfBirth.orEmpty()
        sex = normalizeSex(profile.sex ?: profile.gender)
        address = profile.homeAddress ?: profile.address.orEmpty()
        parish = profile.parish.orEmpty()
        nextOfKinName = profile.nextOfKinName ?: profile.emergencyContactName.orEmpty()
        nextOfKinPhone = profile.nextOfKinPhone ?: profile.emergencyContactPhone.orEmpty()
        nextOfKinRelationship =
            profile.nextOfKinRelationship ?: profile.emergencyContactRelationship.orEmpty()
        currentMedications = profile.currentMedications.orEmpty()
        allergicMedications = profile.allergicMedications ?: profile.allergies.orEmpty()
        hasAllergies = profile.hasAllergies == true || allergicMedications.isNotBlank()
        selectedConditions = parseConditions(profile.medicalConditions)
        otherMedicalCondition = profile.otherMedicalCondition
            ?: extractOtherCondition(profile.medicalHistory, selectedConditions)

        profile.userMetadata?.let { meta ->
            if (phone.isBlank()) {
                phone = meta["phone_number"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (dateOfBirth.isBlank()) {
                dateOfBirth = meta["birthdate"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (sex.isBlank()) {
                sex = normalizeSex(meta["gender"]?.jsonPrimitive?.contentOrNull)
            }
            if (address.isBlank()) {
                address = meta["address"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (nextOfKinName.isBlank()) {
                nextOfKinName = meta["emergency_contact_name"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (nextOfKinPhone.isBlank()) {
                nextOfKinPhone = meta["emergency_contact_phone"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (nextOfKinRelationship.isBlank()) {
                nextOfKinRelationship =
                    meta["emergency_contact_relationship"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (currentMedications.isBlank()) {
                currentMedications =
                    meta["current_medications"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            if (allergicMedications.isBlank()) {
                allergicMedications =
                    meta["allergic_medications"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
            meta["has_allergies"]?.jsonPrimitive?.contentOrNull?.let {
                hasAllergies = it.equals("true", ignoreCase = true) || allergicMedications.isNotBlank()
            }
            if (selectedConditions.isEmpty()) {
                selectedConditions = parseConditionsFromMeta(meta["medical_conditions"])
            }
            if (otherMedicalCondition.isBlank()) {
                otherMedicalCondition =
                    meta["other_medical_condition"]?.jsonPrimitive?.contentOrNull.orEmpty()
            }
        }
    }

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.profileRepository.fetch() }
            .onSuccess { resp ->
                resp.profile?.let(::applyProfile)
                error = null
            }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Profile", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Personal information")
        OutlinedTextField(
            name,
            { name = it },
            label = { Text("Full name *") },
            modifier = Modifier.fillMaxWidth(),
        )
        IsoDatePickerField(
            dateIso = dateOfBirth,
            onDateChange = { dateOfBirth = it },
            label = "Date of birth *",
        )
        BodyCopy("Sex *")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            sexOptions.forEach { (value, label) ->
                FilterChip(
                    selected = sex == value,
                    onClick = { sex = value },
                    label = { Text(label) },
                )
            }
        }
        OutlinedTextField(
            phone,
            { phone = it },
            label = { Text("Preferred phone *") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            email,
            { email = it },
            label = { Text("Preferred email *") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            address,
            { address = it },
            label = { Text("Home address") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )
        ExposedDropdownMenuBox(
            expanded = parishMenuOpen,
            onExpandedChange = { parishMenuOpen = it },
        ) {
            OutlinedTextField(
                value = parish,
                onValueChange = {},
                readOnly = true,
                label = { Text("Parish *") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(parishMenuOpen) },
                modifier = Modifier
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                    .fillMaxWidth(),
            )
            ExposedDropdownMenu(
                expanded = parishMenuOpen,
                onDismissRequest = { parishMenuOpen = false },
            ) {
                jamaicaParishes.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option) },
                        onClick = {
                            parish = option
                            parishMenuOpen = false
                        },
                    )
                }
            }
        }

        SectionTitle("Emergency contact")
        OutlinedTextField(
            nextOfKinName,
            { nextOfKinName = it },
            label = { Text("Name") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            nextOfKinPhone,
            { nextOfKinPhone = it },
            label = { Text("Phone number") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            nextOfKinRelationship,
            { nextOfKinRelationship = it },
            label = { Text("Relationship") },
            modifier = Modifier.fillMaxWidth(),
        )

        SectionTitle("Medical history")
        BodyCopy("Have you been diagnosed with any of the following illnesses?")
        medicalConditionsList.forEach { condition ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Checkbox(
                    checked = selectedConditions.contains(condition),
                    onCheckedChange = { checked ->
                        selectedConditions = toggleCondition(selectedConditions, condition, checked)
                    },
                )
                Text(condition)
            }
        }
        if (selectedConditions.contains("Other")) {
            OutlinedTextField(
                otherMedicalCondition,
                { otherMedicalCondition = it },
                label = { Text("Please specify other medical illnesses") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                placeholder = { Text("Please describe your other medical illnesses…") },
            )
        }

        SectionTitle("Medications")
        BodyCopy("List your current medications")
        OutlinedTextField(
            currentMedications,
            { currentMedications = it },
            label = { Text("Current medications") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 4,
            placeholder = { Text("List all current medications, dosages, and frequency…") },
        )
        BodyCopy("Are you allergic to any medications?")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = hasAllergies,
                onClick = { hasAllergies = true },
                label = { Text("Yes") },
            )
            FilterChip(
                selected = !hasAllergies,
                onClick = {
                    hasAllergies = false
                    allergicMedications = ""
                },
                label = { Text("No") },
            )
        }
        if (hasAllergies) {
            OutlinedTextField(
                allergicMedications,
                { allergicMedications = it },
                label = { Text("Medication and other allergies") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                placeholder = { Text("List all medications and other allergies…") },
            )
        }

        Button(
            enabled = !saving,
            onClick = {
                if (name.isBlank() || email.isBlank() || phone.isBlank() ||
                    dateOfBirth.isBlank() || sex.isBlank() || parish.isBlank()
                ) {
                    error = "Please fill in all required fields (name, DOB, sex, phone, email, parish)."
                    return@Button
                }
                scope.launch {
                    saving = true
                    val conditions = selectedConditions.toList()
                    val payload = buildJsonObject {
                        put("name", name.trim())
                        put("preferredEmail", email.trim())
                        put("userEmail", email.trim())
                        put("email", email.trim())
                        put("preferredPhone", phone.trim())
                        put("phone", phone.trim())
                        put("dateOfBirth", dateOfBirth.trim())
                        put("sex", sex)
                        put("gender", sex)
                        put("homeAddress", address.trim())
                        put("address", address.trim())
                        put("parish", parish)
                        put("nextOfKinName", nextOfKinName.trim())
                        put("nextOfKinPhone", nextOfKinPhone.trim())
                        put("nextOfKinRelationship", nextOfKinRelationship.trim())
                        put("emergencyContactName", nextOfKinName.trim())
                        put("emergencyContactPhone", nextOfKinPhone.trim())
                        put("emergencyContactRelationship", nextOfKinRelationship.trim())
                        put("medicalConditions", buildJsonArray {
                            conditions.forEach { add(it) }
                        })
                        put("otherMedicalCondition", otherMedicalCondition.trim())
                        put("medicalHistory", otherMedicalCondition.trim())
                        put("currentMedications", currentMedications.trim())
                        put("hasAllergies", hasAllergies)
                        put("allergicMedications", allergicMedications.trim())
                        put("allergies", allergicMedications.trim())
                    }
                    runCatching { AppContainer.profileRepository.save(payload) }
                        .onSuccess {
                            message = "Profile saved"
                            error = null
                        }
                        .onFailure { error = it.message }
                    saving = false
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (saving) "Saving…" else "Save profile")
        }
    }
}

private fun normalizeSex(raw: String?): String {
    val value = raw?.trim()?.lowercase().orEmpty()
    return when (value) {
        "male", "m" -> "male"
        "female", "f" -> "female"
        "other" -> "other"
        else -> value
    }
}

private fun parseConditions(raw: String?): Set<String> {
    if (raw.isNullOrBlank()) return emptySet()
    val parts = raw.split(',', ';').map { it.trim() }.filter { it.isNotEmpty() }
    val known = parts.filter { medicalConditionsList.contains(it) }.toMutableSet()
    val unknown = parts.filterNot { medicalConditionsList.contains(it) }
    if (unknown.isNotEmpty()) known.add("Other")
    return known
}

private fun parseConditionsFromMeta(element: kotlinx.serialization.json.JsonElement?): Set<String> {
    if (element == null) return emptySet()
    return when (element) {
        is kotlinx.serialization.json.JsonArray ->
            element.mapNotNull { it.jsonPrimitive.contentOrNull }.toSet()
                .let { selected ->
                    selected.filter { medicalConditionsList.contains(it) }.toMutableSet().also { set ->
                        if (selected.any { !medicalConditionsList.contains(it) }) set.add("Other")
                    }
                }
        is JsonPrimitive -> parseConditions(element.contentOrNull)
        else -> emptySet()
    }
}

private fun extractOtherCondition(medicalHistory: String?, selected: Set<String>): String {
    if (!selected.contains("Other")) return ""
    val history = medicalHistory?.trim().orEmpty()
    if (history.isBlank()) return ""
    // Avoid duplicating known condition names into the free-text field.
    return history
        .split(',', ';')
        .map { it.trim() }
        .filter { it.isNotEmpty() && !medicalConditionsList.contains(it) }
        .joinToString(", ")
}

private fun toggleCondition(current: Set<String>, condition: String, checked: Boolean): Set<String> {
    val next = current.toMutableSet()
    if (checked) {
        if (condition == "None of the above") {
            next.clear()
            next.add(condition)
        } else {
            next.remove("None of the above")
            next.add(condition)
        }
    } else {
        next.remove(condition)
    }
    return next
}
