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
import com.lukariagroup.app.data.models.SideEffectEntry
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun AdminPatientSideEffectsScreen(userId: String, onBack: () -> Unit) {
    var entries by remember { mutableStateOf<List<SideEffectEntry>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var reviewNotes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching {
                val se = AppContainer.adminRepository.fetchSideEffects(userId, limit = 4)
                val p = AppContainer.adminRepository.fetchProfile(userId)
                se to p
            }.onSuccess { (se, p) ->
                entries = se.sideEffects
                patientName = p.profile?.name ?: userId
                error = null
            }.onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(userId) { refresh() }

    LukariaScaffold(title = "Side Effects", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        AdminGeneratePdfButton(
            title = "Side Effects",
            patientName = patientName,
            sections = {
                entries.map { entry ->
                    AdminPdfSection(
                        entry.date ?: "Entry",
                        "Severity: ${entry.severity ?: "—"} · Reviewed: ${entry.reviewed}\n" +
                            "Symptoms: ${entry.symptoms.joinToString().ifBlank { "—" }}\n" +
                            "Notes: ${entry.notes ?: "—"}\n" +
                            "Review notes: ${entry.reviewNotes ?: "—"}",
                    )
                }.ifEmpty { listOf(AdminPdfSection("Side effects", "No entries")) }
            },
        )

        OutlinedTextField(
            reviewNotes,
            { reviewNotes = it },
            label = { Text("Review notes") },
            modifier = Modifier.fillMaxWidth(),
        )

        if (entries.isEmpty()) BodyCopy("No recent side effect entries.")
        entries.forEach { entry ->
            SectionTitle(entry.date ?: "Entry")
            BodyCopy("Severity: ${entry.severity ?: "—"}")
            BodyCopy("Status: ${if (entry.reviewed) "Reviewed" else "Open"}")
            BodyCopy("Symptoms: ${entry.symptoms.joinToString().ifBlank { "—" }}")
            BodyCopy(entry.notes ?: "")
            if (entry.reviewed) {
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            runCatching {
                                AppContainer.adminRepository.reviewSideEffect(
                                    userId = userId,
                                    entryId = entry.entryId,
                                    reviewNotes = reviewNotes.ifBlank { entry.reviewNotes.orEmpty() },
                                    reviewed = false,
                                )
                            }.onSuccess {
                                message = "Reopened"
                                refresh()
                            }.onFailure { error = it.message }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Reopen") }
            } else {
                Button(
                    onClick = {
                        scope.launch {
                            runCatching {
                                AppContainer.adminRepository.reviewSideEffect(
                                    userId = userId,
                                    entryId = entry.entryId,
                                    reviewNotes = reviewNotes,
                                    reviewed = true,
                                )
                            }.onSuccess {
                                message = "Marked reviewed"
                                refresh()
                            }.onFailure { error = it.message }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Mark Reviewed") }
            }
        }
    }
}
