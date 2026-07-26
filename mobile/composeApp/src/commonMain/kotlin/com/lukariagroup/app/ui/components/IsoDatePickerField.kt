package com.lukariagroup.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.core.epochMillisToIsoDate
import com.lukariagroup.app.core.isoDateToEpochMillis
import com.lukariagroup.app.core.todayIsoDate

/**
 * Read-only field that opens a Material3 date picker. [dateIso] is `YYYY-MM-DD`.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IsoDatePickerField(
    dateIso: String,
    onDateChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Date",
    enabled: Boolean = true,
) {
    var showPicker by remember { mutableStateOf(false) }
    val initialMillis = remember(dateIso) {
        isoDateToEpochMillis(dateIso.ifBlank { todayIsoDate() })
    }
    val datePickerState = rememberDatePickerState(initialSelectedDateMillis = initialMillis)

    OutlinedTextField(
        value = dateIso,
        onValueChange = {},
        readOnly = true,
        enabled = enabled,
        label = { Text(label) },
        modifier = modifier
            .fillMaxWidth()
            .clickable(enabled = enabled) { showPicker = true },
        trailingIcon = {
            TextButton(onClick = { if (enabled) showPicker = true }, enabled = enabled) {
                Text("Pick")
            }
        },
    )

    if (showPicker) {
        DatePickerDialog(
            onDismissRequest = { showPicker = false },
            confirmButton = {
                Button(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            onDateChange(epochMillisToIsoDate(millis))
                        }
                        showPicker = false
                    },
                ) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showPicker = false }) { Text("Cancel") }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}
