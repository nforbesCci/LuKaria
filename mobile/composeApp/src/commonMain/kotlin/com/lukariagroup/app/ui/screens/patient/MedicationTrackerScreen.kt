package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.FormularyMedication
import com.lukariagroup.app.data.models.MedicationEntry
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MedicationTrackerScreen(onBack: () -> Unit) {
    var history by remember { mutableStateOf<List<MedicationEntry>>(emptyList()) }
    var formulary by remember { mutableStateOf<List<FormularyMedication>>(emptyList()) }
    var name by remember { mutableStateOf("") }
    var dose by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(todayIsoDate()) }
    var taken by remember { mutableStateOf(true) }
    var notes by remember { mutableStateOf("") }
    var nameOpen by remember { mutableStateOf(false) }
    var doseOpen by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val selectedMed = formulary.find { it.name == name }
    val doses = selectedMed?.doses.orEmpty()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.medicationRepository.allowed() }
                .onSuccess { formulary = it.medications }
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
        IsoDatePickerField(dateIso = date, onDateChange = { date = it })

        ExposedDropdownMenuBox(expanded = nameOpen, onExpandedChange = { nameOpen = it }) {
            OutlinedTextField(
                value = name,
                onValueChange = {},
                readOnly = true,
                label = { Text("Medication") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(nameOpen) },
                modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable).fillMaxWidth(),
            )
            ExposedDropdownMenu(expanded = nameOpen, onDismissRequest = { nameOpen = false }) {
                formulary.forEach { med ->
                    DropdownMenuItem(
                        text = { Text(med.name) },
                        onClick = {
                            name = med.name
                            dose = med.doses.firstOrNull().orEmpty()
                            nameOpen = false
                        },
                    )
                }
            }
        }

        ExposedDropdownMenuBox(expanded = doseOpen, onExpandedChange = { doseOpen = it }) {
            OutlinedTextField(
                value = dose,
                onValueChange = {},
                readOnly = true,
                label = { Text("Dose") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(doseOpen) },
                modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable).fillMaxWidth(),
                enabled = doses.isNotEmpty(),
            )
            ExposedDropdownMenu(expanded = doseOpen, onDismissRequest = { doseOpen = false }) {
                doses.forEach { d ->
                    DropdownMenuItem(
                        text = { Text(d) },
                        onClick = {
                            dose = d
                            doseOpen = false
                        },
                    )
                }
            }
        }

        OutlinedTextField(
            notes,
            { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 4,
        )
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
                                dosage = dose,
                                taken = taken,
                                notes = notes.ifBlank { null },
                            ),
                        )
                    }.onSuccess { refresh() }.onFailure { error = it.message }
                }
            },
            enabled = name.isNotBlank() && dose.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save") }

        SectionTitle("History")
        history.take(20).forEach {
            Text("${it.date}: ${it.medicationName} ${it.dosage ?: it.dose} taken=${it.taken}")
        }
    }
}
