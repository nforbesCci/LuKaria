package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.SideEffectEntry
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun SideEffectsScreen(onBack: () -> Unit) {
    var history by remember { mutableStateOf<List<SideEffectEntry>>(emptyList()) }
    var date by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var severity by remember { mutableFloatStateOf(3f) }
    var nausea by remember { mutableStateOf(false) }
    var vomiting by remember { mutableStateOf(false) }
    var constipation by remember { mutableStateOf(false) }
    var diarrhea by remember { mutableStateOf(false) }
    var fatigue by remember { mutableStateOf(false) }
    var headache by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.sideEffectRepository.fetch() }
                .onSuccess { history = it.sideEffects; error = null }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Side effects", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        SectionTitle("Log today")
        OutlinedTextField(date, { date = it }, label = { Text("Date") }, modifier = Modifier.fillMaxWidth())
        Text("Severity: ${severity.toInt()}")
        Slider(value = severity, onValueChange = { severity = it }, valueRange = 1f..10f, steps = 8)
        @Composable
        fun Flag(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Checkbox(checked, onChange)
                Text(label)
            }
        }
        Flag("Nausea", nausea) { nausea = it }
        Flag("Vomiting", vomiting) { vomiting = it }
        Flag("Constipation", constipation) { constipation = it }
        Flag("Diarrhea", diarrhea) { diarrhea = it }
        Flag("Fatigue", fatigue) { fatigue = it }
        Flag("Headache", headache) { headache = it }
        OutlinedTextField(notes, { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth())

        Button(
            onClick = {
                scope.launch {
                    val symptoms = buildList {
                        if (nausea) add("nausea")
                        if (vomiting) add("vomiting")
                        if (constipation) add("constipation")
                        if (diarrhea) add("diarrhea")
                        if (fatigue) add("fatigue")
                        if (headache) add("headache")
                    }
                    runCatching {
                        AppContainer.sideEffectRepository.save(
                            SideEffectEntry(
                                date = date.ifBlank { null },
                                symptoms = symptoms,
                                severity = severity.toInt(),
                                notes = notes.ifBlank { null },
                                nausea = nausea,
                                vomiting = vomiting,
                                constipation = constipation,
                                diarrhea = diarrhea,
                                fatigue = fatigue,
                                headache = headache,
                            ),
                        )
                    }.onSuccess { refresh() }.onFailure { error = it.message }
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Submit") }

        SectionTitle("History")
        history.take(15).forEach {
            Text("${it.date}: sev=${it.severity} ${it.symptoms.joinToString()}")
        }
    }
}
