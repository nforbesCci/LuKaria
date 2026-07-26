package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
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
import com.lukariagroup.app.data.models.BlogPost
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun BlogCmsScreen(onBack: () -> Unit) {
    var posts by remember { mutableStateOf<List<BlogPost>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.blogRepository.listPosts() }
                .onSuccess { posts = it; error = null }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Blog CMS", onBack = onBack) {
        SectionTitle("Published posts")
        BodyCopy("Create/edit with images uses multipart on web CMS. Mobile M0 lists and deletes posts.")
        if (loading) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }
        OutlinedButton(onClick = { refresh() }, modifier = Modifier.fillMaxWidth()) { Text("Refresh") }
        posts.forEach { post ->
            val id = post.id ?: return@forEach
            Text(post.title ?: id)
            Button(
                onClick = {
                    scope.launch {
                        runCatching { AppContainer.blogRepository.deletePost(id) }
                            .onSuccess {
                                message = "Deleted"
                                refresh()
                            }
                            .onFailure { error = it.message }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Delete") }
        }
    }
}
