package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
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
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.SideEffectEntry
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun AdminSideEffectsScreen(onBack: () -> Unit) {
    var entries by remember { mutableStateOf<List<SideEffectEntry>>(emptyList()) }
    var userId by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.adminRepository.listAllSideEffects() }
            .onSuccess { entries = it.sideEffects; error = null }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Side effects review", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }
        SectionTitle("Queue")
        entries.take(25).forEach {
            Text("${it.date}: sev=${it.severity} reviewed=${it.reviewed} ${it.symptoms.joinToString()}")
        }

        SectionTitle("Mark reviewed")
        OutlinedTextField(userId, { userId = it }, label = { Text("Patient userId") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(notes, { notes = it }, label = { Text("Review notes") }, modifier = Modifier.fillMaxWidth())
        Button(
            onClick = {
                scope.launch {
                    runCatching {
                        AppContainer.adminRepository.reviewSideEffect(userId, reviewNotes = notes)
                    }.onSuccess {
                        message = "Review saved"
                        error = null
                    }.onFailure { error = it.message }
                }
            },
            enabled = userId.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Submit review") }
    }
}
