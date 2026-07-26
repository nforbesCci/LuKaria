package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.AdminUserSummary
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.navigation.AppRoute
import kotlinx.coroutines.delay

private const val PAGE_SIZE = 5

@Composable
fun AdminHomeScreen(
    onBack: () -> Unit,
    onNavigate: (String) -> Unit,
    onOpenChart: (String) -> Unit,
) {
    var users by remember { mutableStateOf<List<AdminUserSummary>>(emptyList()) }
    var total by remember { mutableIntStateOf(0) }
    var page by remember { mutableIntStateOf(0) }
    var searchInput by remember { mutableStateOf("") }
    var searchQuery by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    // Debounce search; Auth0 q requires 3+ chars (API ignores shorter)
    LaunchedEffect(searchInput) {
        delay(350)
        val next = searchInput.trim()
        if (next != searchQuery) {
            searchQuery = next
            page = 0
        }
    }

    LaunchedEffect(page, searchQuery) {
        loading = true
        error = null
        runCatching {
            AppContainer.adminRepository.listUsers(
                page = page,
                perPage = PAGE_SIZE,
                search = searchQuery,
            )
        }
            .onSuccess {
                users = it.users
                total = it.total
                error = if (!it.success) it.error ?: it.details else null
            }
            .onFailure { err ->
                val raw = err.message.orEmpty()
                error = Regex(""""(?:error|details)"\s*:\s*"([^"]+)"""")
                    .find(raw)?.groupValues?.getOrNull(1)
                    ?: raw.ifBlank { "Failed to load users" }
                users = emptyList()
                total = 0
            }
        loading = false
    }

    val totalPages = if (total <= 0) 1 else ((total + PAGE_SIZE - 1) / PAGE_SIZE)
    val canPrev = page > 0
    val canNext = (page + 1) * PAGE_SIZE < total
    val rangeStart = if (total == 0) 0 else page * PAGE_SIZE + 1
    val rangeEnd = minOf(total, (page + 1) * PAGE_SIZE)

    LukariaScaffold(title = "Admin", onBack = onBack) {
        SectionTitle("Tools")
        Button(onClick = { onNavigate(AppRoute.RescheduleRequests.route) }, modifier = Modifier.fillMaxWidth()) {
            Text("Reschedule requests")
        }
        Button(onClick = { onNavigate(AppRoute.AdminSideEffects.route) }, modifier = Modifier.fillMaxWidth()) {
            Text("Side effects review")
        }
        Button(onClick = { onNavigate(AppRoute.LabRequisition.route) }, modifier = Modifier.fillMaxWidth()) {
            Text("Lab requisition")
        }
        Button(onClick = { onNavigate(AppRoute.BlogCms.route) }, modifier = Modifier.fillMaxWidth()) {
            Text("Blog CMS")
        }

        SectionTitle("Patients")
        OutlinedTextField(
            value = searchInput,
            onValueChange = { searchInput = it },
            label = { Text("Search patients") },
            placeholder = { Text("Email or name (3+ characters)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        if (searchQuery.isNotEmpty() && searchQuery.length < 3) {
            BodyCopy("Type at least 3 characters to search.")
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                if (total == 0) "No patients" else "$rangeStart–$rangeEnd of $total",
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                "Page ${page + 1} / $totalPages",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        if (loading) LoadingBlock("Loading patients…")
        ErrorText(error)

        users.forEach { user ->
            val id = user.userId ?: return@forEach
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenChart(id) },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            ) {
                Text(
                    user.name ?: user.email ?: id,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    user.email.orEmpty(),
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedButton(
                onClick = { if (canPrev) page -= 1 },
                enabled = canPrev && !loading,
                modifier = Modifier.weight(1f),
            ) { Text("Previous") }
            OutlinedButton(
                onClick = { if (canNext) page += 1 },
                enabled = canNext && !loading,
                modifier = Modifier.weight(1f),
            ) { Text("Next") }
        }
    }
}
