package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.MeasurementEntry
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.components.WeightChartPoint
import com.lukariagroup.app.ui.components.WeightTrendChart
import kotlinx.coroutines.launch

private fun apiErrorMessage(throwable: Throwable): String =
    "${throwable.message ?: "Request failed"} (API: ${PlatformConfig.apiBaseUrl})"

@Composable
fun WeightLoggingScreen(onBack: () -> Unit) {
    var history by remember { mutableStateOf<List<MeasurementEntry>>(emptyList()) }
    var weight by remember { mutableStateOf("") }
    var waist by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(todayIsoDate()) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    val chartPoints = remember(history) {
        history
            .mapNotNull { entry ->
                val w = entry.weight ?: return@mapNotNull null
                val d = entry.displayDate ?: return@mapNotNull null
                WeightChartPoint(label = d, weight = w)
            }
            .sortedBy { it.label }
    }

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.measurementRepository.fetchAll() }
                .onSuccess {
                    history = it.measurements.ifEmpty { listOfNotNull(it.measurement) }
                    error = null
                }
                .onFailure { error = apiErrorMessage(it) }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Weight logging", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Weight trend")
        WeightTrendChart(points = chartPoints)

        SectionTitle("Log measurement")
        IsoDatePickerField(
            dateIso = date,
            onDateChange = { date = it },
            label = "Date",
        )
        OutlinedTextField(
            value = weight,
            onValueChange = { weight = it },
            label = { Text("Weight (lbs)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Decimal,
                imeAction = ImeAction.Next,
            ),
        )
        OutlinedTextField(
            value = waist,
            onValueChange = { waist = it },
            label = { Text("Waist (in)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Decimal,
                imeAction = ImeAction.Next,
            ),
        )
        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(
                onDone = { focusManager.clearFocus() },
            ),
        )
        Button(
            onClick = {
                focusManager.clearFocus()
                scope.launch {
                    saving = true
                    error = null
                    message = null
                    val waistValue = waist.toDoubleOrNull()
                    try {
                        AppContainer.measurementRepository.save(
                            MeasurementEntry(
                                date = date.ifBlank { todayIsoDate() },
                                dateKey = date.ifBlank { todayIsoDate() },
                                weight = weight.toDoubleOrNull(),
                                waist = waistValue,
                                waistCircumference = waistValue,
                                notes = notes.ifBlank { null },
                            ),
                        )
                        message = "Saved"
                        weight = ""
                        waist = ""
                        notes = ""
                        date = todayIsoDate()
                        refresh()
                    } catch (t: Throwable) {
                        error = apiErrorMessage(t)
                    } finally {
                        saving = false
                    }
                }
            },
            enabled = !saving && weight.toDoubleOrNull() != null,
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (saving) "Saving…" else "Save") }

        SectionTitle("History")
        history.take(20).forEach { entry ->
            Text(
                "${entry.displayDate ?: "—"}: ${entry.weight ?: "—"} lbs  " +
                    "waist=${entry.displayWaist ?: "—"}",
            )
        }
    }
}
