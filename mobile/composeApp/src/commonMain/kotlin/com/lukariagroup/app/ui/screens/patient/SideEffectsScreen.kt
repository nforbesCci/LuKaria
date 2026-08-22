package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
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
import com.lukariagroup.app.data.models.SideEffectEntry
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import kotlinx.serialization.json.add

private val SIDE_EFFECT_OPTIONS = listOf(
    "Nausea",
    "Vomiting",
    "Bloating",
    "Belching",
    "Constipation",
    "Diarrhoea",
    "Fatigue",
    "Vision Changes",
    "Headache",
)

private const val DEFAULT_SEVERITY = 3
private const val OTHER_KEY = "Other"

@Composable
fun SideEffectsScreen(onBack: () -> Unit) {
    var history by remember { mutableStateOf<List<SideEffectEntry>>(emptyList()) }
    var date by remember { mutableStateOf(todayIsoDate()) }
    var selected by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    var otherEnabled by remember { mutableStateOf(false) }
    var otherText by remember { mutableStateOf("") }
    var otherSeverity by remember { mutableStateOf(DEFAULT_SEVERITY) }
    var notes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.sideEffectRepository.fetch() }
                .onSuccess {
                    history = it.sideEffects
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Side effects", onBack = onBack) {
        if (loading && history.isEmpty()) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it, color = MaterialTheme.colorScheme.primary) }

        SectionTitle("Log side effects")
        IsoDatePickerField(dateIso = date, onDateChange = { date = it })
        BodyCopy("Check each effect you have and set its severity (1 = mild, 10 = severe).")

        SIDE_EFFECT_OPTIONS.forEach { label ->
            val checked = label in selected
            Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Checkbox(
                        checked = checked,
                        onCheckedChange = { on ->
                            selected = if (on) {
                                selected + (label to DEFAULT_SEVERITY)
                            } else {
                                selected - label
                            }
                        },
                    )
                    Text(label, modifier = Modifier.weight(1f))
                }
                if (checked) {
                    val sev = selected[label] ?: DEFAULT_SEVERITY
                    Text("Severity: $sev", style = MaterialTheme.typography.bodySmall)
                    Slider(
                        value = sev.toFloat(),
                        onValueChange = { v ->
                            selected = selected + (label to v.toInt().coerceIn(1, 10))
                        },
                        valueRange = 1f..10f,
                        steps = 8,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }

        Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Checkbox(checked = otherEnabled, onCheckedChange = { otherEnabled = it })
                Text("Other", modifier = Modifier.weight(1f))
            }
            if (otherEnabled) {
                OutlinedTextField(
                    value = otherText,
                    onValueChange = { otherText = it },
                    label = { Text("Describe other side effect") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                Text("Severity: $otherSeverity", style = MaterialTheme.typography.bodySmall)
                Slider(
                    value = otherSeverity.toFloat(),
                    onValueChange = { otherSeverity = it.toInt().coerceIn(1, 10) },
                    valueRange = 1f..10f,
                    steps = 8,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Additional notes (optional)") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )

        Button(
            onClick = {
                if (selected.isEmpty() && !(otherEnabled && otherText.isNotBlank())) {
                    error = "Select at least one side effect (or Other)."
                    return@Button
                }
                if (otherEnabled && otherText.isBlank()) {
                    error = "Describe the other side effect, or uncheck Other."
                    return@Button
                }
                scope.launch {
                    saving = true
                    error = null
                    message = null
                    val severities = selected.toMutableMap()
                    if (otherEnabled) severities[OTHER_KEY] = otherSeverity
                    val overall = severities.values.maxOrNull() ?: DEFAULT_SEVERITY
                    runCatching {
                        AppContainer.sideEffectRepository.saveReport(
                            buildJsonObject {
                                putJsonArray("sideEffects") {
                                    selected.keys.forEach { add(it) }
                                }
                                putJsonObject("sideEffectSeverities") {
                                    severities.forEach { (k, v) -> put(k, v) }
                                }
                                put("otherSideEffect", if (otherEnabled) otherText.trim() else "")
                                if (otherEnabled) put("otherSeverity", otherSeverity)
                                put("severity", overall)
                                put("notes", notes.trim())
                                put("reportDate", date)
                                put("contactMessage", notes.trim())
                            },
                        )
                    }.onSuccess {
                        message = "Report saved"
                        selected = emptyMap()
                        otherEnabled = false
                        otherText = ""
                        otherSeverity = DEFAULT_SEVERITY
                        notes = ""
                        refresh()
                    }.onFailure { error = it.message }
                    saving = false
                }
            },
            enabled = !saving,
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (saving) "Saving…" else "Submit") }

        SectionTitle("History")
        history.take(15).forEach { entry ->
            val lines = formatSideEffectHistory(entry)
            Text(
                "${entry.date ?: entry.reportDate ?: "?"}: $lines",
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

private fun formatSideEffectHistory(entry: SideEffectEntry): String {
    val sev = entry.sideEffectSeverities.orEmpty()
    val named = entry.sideEffects.ifEmpty { entry.symptoms }
    val parts = named.map { name ->
        val s = sev[name] ?: entry.severity
        if (s != null) "$name ($s/10)" else name
    }.toMutableList()
    val other = entry.otherSideEffect?.trim().orEmpty()
    if (other.isNotEmpty()) {
        val os = entry.otherSeverity ?: sev[OTHER_KEY] ?: entry.severity
        parts += if (os != null) "Other: $other ($os/10)" else "Other: $other"
    }
    return parts.joinToString().ifBlank { "sev=${entry.severity ?: "?"}" }
}
