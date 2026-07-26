package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedButton
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
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.AdminQuestion
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun AdminQuestionsScreen(userId: String, onBack: () -> Unit) {
    var questions by remember { mutableStateOf<List<AdminQuestion>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching {
                val q = AppContainer.adminRepository.fetchQuestions(userId)
                val p = AppContainer.adminRepository.fetchProfile(userId)
                q to p
            }.onSuccess { (q, p) ->
                questions = q.questions
                patientName = p.profile?.name ?: userId
                error = null
            }.onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(userId) { refresh() }

    LukariaScaffold(title = "Questions", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        AdminGeneratePdfButton(
            title = "Questions",
            patientName = patientName,
            sections = {
                questions.map { q ->
                    AdminPdfSection(
                        q.category ?: "Question",
                        "${q.displayText}\nAnswered: ${q.isAnswered}" +
                            (q.answer?.takeIf { it.isNotBlank() }?.let { "\n$it" } ?: ""),
                    )
                }.ifEmpty { listOf(AdminPdfSection("Questions", "No questions")) }
            },
        )

        if (questions.isEmpty()) BodyCopy("No questions.")
        questions.forEach { q ->
            SectionTitle(q.category ?: "Question")
            BodyCopy(q.displayText)
            BodyCopy(if (q.isAnswered) "Answered" else "Unanswered")
            if (!q.answer.isNullOrBlank()) BodyCopy(q.answer)
            if (!q.isAnswered && !q.id.isNullOrBlank()) {
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            runCatching {
                                AppContainer.adminRepository.deleteQuestion(userId, q.id)
                            }.onSuccess {
                                message = "Question deleted"
                                refresh()
                            }.onFailure { error = it.message }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Delete") }
            }
        }
    }
}
