package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.RescheduleRequest
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun RescheduleRequestsScreen(onBack: () -> Unit) {
    var requests by remember { mutableStateOf<List<RescheduleRequest>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.adminRepository.listRescheduleRequests() }
            .onSuccess { requests = it.requests; error = null }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Reschedule requests", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        SectionTitle("${requests.size} open")
        requests.forEach { req ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            ) {
                Text(req.userName ?: req.userEmail ?: req.userId ?: "Patient", modifier = Modifier.padding(16.dp))
                Text("Reason: ${req.reason.orEmpty()}", modifier = Modifier.padding(horizontal = 16.dp))
                Text("Preferred: ${req.preferredTimes.orEmpty()}", modifier = Modifier.padding(horizontal = 16.dp))
                Text("Status: ${req.status ?: "pending"}", modifier = Modifier.padding(16.dp))
            }
        }
    }
}
