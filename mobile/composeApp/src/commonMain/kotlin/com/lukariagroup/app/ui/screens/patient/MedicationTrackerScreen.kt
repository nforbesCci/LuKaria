package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
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
import com.lukariagroup.app.data.models.MedicationEntry
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun MedicationTrackerScreen(onBack: () -> Unit) {
    var history by remember { mutableStateOf<List<MedicationEntry>>(emptyList()) }
    var name by remember { mutableStateOf("") }
    var dose by remember { mutableStateOf("") }
    var site by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    var taken by remember { mutableStateOf(true) }
    var notes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.medicationRepository.fetchAll() }
                .onSuccess {
                    history = it.medications.ifEmpty { listOfNotNull(it.medication) }
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Medications", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        SectionTitle("Log dose")
        OutlinedTextField(date, { date = it }, label = { Text("Date") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(name, { name = it }, label = { Text("Medication") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(dose, { dose = it }, label = { Text("Dose") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(site, { site = it }, label = { Text("Injection site") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(notes, { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth())
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Checkbox(checked = taken, onCheckedChange = { taken = it })
            Text("Taken")
        }
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.medicationRepository.save(
                            MedicationEntry(
                                date = date.ifBlank { null },
                                medicationName = name,
                                dose = dose,
                                taken = taken,
                                injectionSite = site.ifBlank { null },
                                notes = notes.ifBlank { null },
                            ),
                        )
                    }.onSuccess { refresh() }.onFailure { error = it.message }
                }
            },
            enabled = name.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save") }

        SectionTitle("History")
        history.take(20).forEach {
            Text("${it.date}: ${it.medicationName} ${it.dose} taken=${it.taken}")
        }
    }
}
