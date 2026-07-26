package com.lukariagroup.app.ui.screens.patient

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
import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun ProfileWizardScreen(onBack: () -> Unit) {
    var profile by remember { mutableStateOf(PatientProfile()) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.profileRepository.fetch() }
            .onSuccess { resp ->
                profile = resp.profile ?: PatientProfile()
                error = null
            }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Profile", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Basic information")
        OutlinedTextField(profile.name.orEmpty(), { profile = profile.copy(name = it) }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.userEmail ?: profile.email.orEmpty(), {
            profile = profile.copy(userEmail = it, email = it)
        }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.phone.orEmpty(), { profile = profile.copy(phone = it) }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.dateOfBirth.orEmpty(), { profile = profile.copy(dateOfBirth = it) }, label = { Text("Date of birth") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.sex.orEmpty(), { profile = profile.copy(sex = it) }, label = { Text("Sex") }, modifier = Modifier.fillMaxWidth())

        SectionTitle("Address")
        OutlinedTextField(profile.address.orEmpty(), { profile = profile.copy(address = it) }, label = { Text("Street") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.city.orEmpty(), { profile = profile.copy(city = it) }, label = { Text("City") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.state.orEmpty(), { profile = profile.copy(state = it) }, label = { Text("State") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.zip.orEmpty(), { profile = profile.copy(zip = it) }, label = { Text("ZIP") }, modifier = Modifier.fillMaxWidth())

        SectionTitle("Clinical")
        OutlinedTextField(profile.allergies.orEmpty(), { profile = profile.copy(allergies = it) }, label = { Text("Allergies") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.currentMedications.orEmpty(), { profile = profile.copy(currentMedications = it) }, label = { Text("Current medications") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(profile.medicalHistory.orEmpty(), { profile = profile.copy(medicalHistory = it) }, label = { Text("Medical history") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            profile.startingWeight?.toString().orEmpty(),
            { profile = profile.copy(startingWeight = it.toDoubleOrNull()) },
            label = { Text("Starting weight (lbs)") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            profile.goalWeight?.toString().orEmpty(),
            { profile = profile.copy(goalWeight = it.toDoubleOrNull()) },
            label = { Text("Goal weight (lbs)") },
            modifier = Modifier.fillMaxWidth(),
        )

        Button(
            enabled = !saving,
            onClick = {
                scope.launch {
                    saving = true
                    runCatching { AppContainer.profileRepository.save(profile) }
                        .onSuccess { message = "Profile saved"; error = null }
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
