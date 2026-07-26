package com.lukariagroup.app.ui.screens.admin

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.MedicationEntry
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun AdminMedicationScreen(userId: String, onBack: () -> Unit) {
    var medications by remember { mutableStateOf<List<MedicationEntry>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(userId) {
        loading = true
        runCatching {
            val m = AppContainer.adminRepository.fetchMedications(userId, daysBack = 28)
            val p = AppContainer.adminRepository.fetchProfile(userId)
            m to p
        }.onSuccess { (m, p) ->
            medications = m.medications
            patientName = p.profile?.name ?: userId
            error = null
        }.onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Medication Tracker", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)

        AdminGeneratePdfButton(
            title = "Medication Tracker",
            patientName = patientName,
            sections = {
                listOf(
                    AdminPdfSection(
                        "Last 28 days",
                        medications.joinToString("\n") {
                            "${it.date}: ${it.medicationName ?: "—"} ${it.dose ?: ""}" +
                                (it.notes?.takeIf { n -> n.isNotBlank() }?.let { n -> " · $n" } ?: "")
                        }.ifBlank { "No medication entries" },
                    ),
                )
            },
        )

        SectionTitle("Last 28 days")
        if (medications.isEmpty()) BodyCopy("No medication entries.")
        medications.forEach { med ->
            BodyCopy("${med.date}: ${med.medicationName ?: "—"} · ${med.dose ?: "—"}")
            if (!med.notes.isNullOrBlank()) BodyCopy(med.notes)
        }
    }
}
