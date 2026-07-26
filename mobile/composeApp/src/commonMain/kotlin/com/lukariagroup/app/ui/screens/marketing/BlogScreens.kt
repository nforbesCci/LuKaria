package com.lukariagroup.app.ui.screens.marketing

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.BlogPost
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun BlogListScreen(
    onBack: () -> Unit,
    onOpenPost: (String) -> Unit,
) {
    var posts by remember { mutableStateOf<List<BlogPost>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.blogRepository.listPosts() }
            .onSuccess { posts = it; error = null }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Blog", onBack = onBack) {
        ErrorText(error)
        if (loading) LoadingBlock()
        posts.forEach { post ->
            val key = post.slug ?: post.id ?: return@forEach
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenPost(key) },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            ) {
                Text(
                    post.title ?: "Untitled",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(16.dp),
                )
                post.createdAt?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
                }
            }
        }
        if (!loading && posts.isEmpty() && error == null) {
            BodyCopy("No posts yet.")
        }
    }
}

@Composable
fun BlogDetailScreen(
    slug: String,
    onBack: () -> Unit,
) {
    var post by remember { mutableStateOf<BlogPost?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(slug) {
        loading = true
        runCatching { AppContainer.blogRepository.getBySlugOrId(slug) }
            .onSuccess { post = it; error = null }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = post?.title ?: "Article", onBack = onBack) {
        ErrorText(error)
        if (loading) LoadingBlock()
        post?.let {
            SectionTitle(it.title ?: "Article")
            it.authorName?.let { name -> BodyCopy("By $name") }
            BodyCopy(it.content ?: "")
        }
    }
}
