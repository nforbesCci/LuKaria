package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

@Composable
fun AdminPatientRescheduleScreen(userId: String, onBack: () -> Unit) {
    var type by remember { mutableStateOf("Initial Consultation") }
    var length by remember { mutableStateOf("30") }
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var saving by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LukariaScaffold(title = "Reschedule", onBack = onBack) {
        SectionTitle("Appointment")
        BodyCopy("Patient: $userId")
        OutlinedTextField(type, { type = it }, label = { Text("Type") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(length, { length = it }, label = { Text("Length (minutes)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(date, { date = it }, label = { Text("Date (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(time, { time = it }, label = { Text("Time (e.g. 10:00 AM)") }, modifier = Modifier.fillMaxWidth())

        ErrorText(error)
        message?.let { Text(it) }

        Button(
            onClick = {
                scope.launch {
                    saving = true
                    runCatching {
                        AppContainer.adminRepository.adminReschedule(
                            buildJsonObject {
                                put("userId", userId)
                                putJsonObject("appointmentData") {
                                    put("type", type)
                                    put("date", date)
                                    put("time", time)
                                    put("length", length.toIntOrNull() ?: 30)
                                }
                            },
                        )
                    }.onSuccess {
                        message = "Appointment saved"
                        error = null
                    }.onFailure { error = it.message }
                    saving = false
                }
            },
            enabled = !saving && date.isNotBlank() && time.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (saving) "Saving…" else "Save appointment") }
    }
}
