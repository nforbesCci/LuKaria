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
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.AppointmentSchedule
import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

private val jamaicaParishes = listOf(
    "Kingston", "St. Andrew", "St. Catherine", "Clarendon", "Manchester",
    "St. Elizabeth", "Westmoreland", "Hanover", "St. James", "Trelawny",
    "St. Ann", "St. Mary", "Portland", "St. Thomas",
)

@Composable
fun AdminProfileSummaryScreen(userId: String, onBack: () -> Unit) {
    var profile by remember { mutableStateOf<PatientProfile?>(null) }
    var schedule by remember { mutableStateOf<AppointmentSchedule?>(null) }
    var editing by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    var phone by remember { mutableStateOf("") }
    var birthdate by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("") }
    var parish by remember { mutableStateOf("") }
    var nextOfKinName by remember { mutableStateOf("") }
    var nextOfKinPhone by remember { mutableStateOf("") }
    var nextOfKinRelationship by remember { mutableStateOf("") }
    var medicalConditions by remember { mutableStateOf("") }
    var currentMedications by remember { mutableStateOf("") }
    var allergies by remember { mutableStateOf("") }

    fun applyProfile(p: PatientProfile?) {
        profile = p
        phone = p?.phone.orEmpty()
        birthdate = p?.dateOfBirth.orEmpty()
        address = p?.address.orEmpty()
        gender = (p?.gender ?: p?.sex).orEmpty()
        parish = p?.parish.orEmpty()
        nextOfKinName = p?.emergencyContactName.orEmpty()
        nextOfKinPhone = p?.emergencyContactPhone.orEmpty()
        nextOfKinRelationship = p?.emergencyContactRelationship.orEmpty()
        medicalConditions = (p?.medicalConditions ?: p?.medicalHistory).orEmpty()
        currentMedications = p?.currentMedications.orEmpty()
        allergies = p?.allergies.orEmpty()
    }

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.adminRepository.fetchProfile(userId) }
                .onSuccess {
                    applyProfile(it.profile)
                    schedule = it.schedule
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(userId) { refresh() }

    val patientName = profile?.name ?: userId

    LukariaScaffold(title = "Profile Summary", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        AdminGeneratePdfButton(
            title = "Profile Summary",
            patientName = patientName,
            sections = {
                listOf(
                    AdminPdfSection(
                        "Contact",
                        """
                        Name: ${profile?.name ?: "—"}
                        Email: ${profile?.userEmail ?: profile?.email ?: "—"}
                        Phone: ${profile?.phone ?: "—"}
                        Address: ${profile?.address ?: "—"}
                        """.trimIndent(),
                    ),
                    AdminPdfSection(
                        "Demographics",
                        """
                        DOB: ${profile?.dateOfBirth ?: "—"}
                        Gender: ${profile?.gender ?: profile?.sex ?: "—"}
                        Parish: ${profile?.parish ?: "—"}
                        """.trimIndent(),
                    ),
                    AdminPdfSection(
                        "Emergency contact",
                        """
                        ${profile?.emergencyContactName ?: "—"}
                        ${profile?.emergencyContactPhone ?: "—"}
                        ${profile?.emergencyContactRelationship ?: "—"}
                        """.trimIndent(),
                    ),
                    AdminPdfSection(
                        "Medical",
                        """
                        Conditions: ${profile?.medicalConditions ?: profile?.medicalHistory ?: "—"}
                        Medications: ${profile?.currentMedications ?: "—"}
                        Allergies: ${profile?.allergies ?: "—"}
                        """.trimIndent(),
                    ),
                    AdminPdfSection(
                        "Schedule",
                        if (schedule?.isScheduled == true) {
                            "${schedule?.type} · ${schedule?.date} ${schedule?.time} (${schedule?.length ?: "—"} min)"
                        } else {
                            "Not scheduled"
                        },
                    ),
                )
            },
        )

        if (!editing) {
            OutlinedButton(onClick = { editing = true }, modifier = Modifier.fillMaxWidth()) {
                Text("Edit profile")
            }
            SectionTitle("Contact")
            BodyCopy("Name: ${profile?.name ?: "—"}")
            BodyCopy("Email: ${profile?.userEmail ?: profile?.email ?: "—"}")
            BodyCopy("Phone: ${profile?.phone ?: "—"}")
            BodyCopy("Address: ${profile?.address ?: "—"}")

            SectionTitle("Demographics")
            BodyCopy("DOB: ${profile?.dateOfBirth ?: "—"}")
            BodyCopy("Gender: ${profile?.gender ?: profile?.sex ?: "—"}")
            BodyCopy("Parish: ${profile?.parish ?: "—"}")

            SectionTitle("Emergency contact")
            BodyCopy(profile?.emergencyContactName ?: "—")
            BodyCopy(profile?.emergencyContactPhone ?: "—")
            BodyCopy(profile?.emergencyContactRelationship ?: "—")

            SectionTitle("Medical")
            BodyCopy("Conditions: ${profile?.medicalConditions ?: profile?.medicalHistory ?: "—"}")
            BodyCopy("Medications: ${profile?.currentMedications ?: "—"}")
            BodyCopy("Allergies: ${profile?.allergies ?: "—"}")

            SectionTitle("Schedule")
            if (schedule?.isScheduled == true) {
                BodyCopy("${schedule?.type} · ${schedule?.date} ${schedule?.time}")
                BodyCopy("Length: ${schedule?.length ?: "—"} min · Status: ${schedule?.status ?: "—"}")
            } else {
                BodyCopy("Not scheduled")
            }
        } else {
            SectionTitle("Edit profile")
            OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(birthdate, { birthdate = it }, label = { Text("Date of birth") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(address, { address = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(gender, { gender = it }, label = { Text("Gender") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(
                parish,
                { parish = it },
                label = { Text("Parish (${jamaicaParishes.take(3).joinToString(", ")}…)") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(nextOfKinName, { nextOfKinName = it }, label = { Text("Emergency contact name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(nextOfKinPhone, { nextOfKinPhone = it }, label = { Text("Emergency contact phone") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(nextOfKinRelationship, { nextOfKinRelationship = it }, label = { Text("Relationship") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(medicalConditions, { medicalConditions = it }, label = { Text("Medical conditions") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(currentMedications, { currentMedications = it }, label = { Text("Current medications") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(allergies, { allergies = it }, label = { Text("Allergies") }, modifier = Modifier.fillMaxWidth())

            Button(
                onClick = {
                    scope.launch {
                        runCatching {
                            AppContainer.adminRepository.updateAdminProfile(
                                userId,
                                buildJsonObject {
                                    putJsonObject("user_metadata") {
                                        put("phone_number", phone)
                                        put("address", address)
                                        put("birthdate", birthdate)
                                        put("gender", gender)
                                        put("emergency_contact_name", nextOfKinName)
                                        put("emergency_contact_phone", nextOfKinPhone)
                                        put("emergency_contact_relationship", nextOfKinRelationship)
                                        put("medical_conditions", medicalConditions)
                                        put("current_medications", currentMedications)
                                        put("allergic_medications", allergies)
                                        put("has_allergies", allergies.isNotBlank())
                                    }
                                    put("dateOfBirth", birthdate)
                                    put("preferredPhone", phone)
                                    put("parish", parish)
                                    put("gender", gender)
                                    put("nextOfKinName", nextOfKinName)
                                    put("nextOfKinPhone", nextOfKinPhone)
                                    put("nextOfKinRelationship", nextOfKinRelationship)
                                    put("medicalConditions", medicalConditions)
                                    put("currentMedications", currentMedications)
                                    put("allergicMedications", allergies)
                                    put("hasAllergies", allergies.isNotBlank())
                                },
                            )
                        }.onSuccess {
                            message = "Profile saved"
                            editing = false
                            refresh()
                        }.onFailure { error = it.message }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Save profile") }
            OutlinedButton(onClick = { editing = false; applyProfile(profile) }, modifier = Modifier.fillMaxWidth()) {
                Text("Cancel")
            }
        }
    }
}
