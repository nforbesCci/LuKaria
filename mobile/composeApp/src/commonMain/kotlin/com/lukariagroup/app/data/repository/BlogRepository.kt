package com.lukariagroup.app.data.repository

import com.lukariagroup.app.core.ApiClient
import com.lukariagroup.app.data.models.BlogComment
import com.lukariagroup.app.data.models.BlogPost
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class BlogRepository(private val client: HttpClient) {
    suspend fun listPosts(): List<BlogPost> {
        val response = client.get("api/blog")
        if (!response.status.isSuccess()) {
            throw ApiException(response.status.value, response.bodyAsText())
        }
        return ApiClient.json.decodeFromString(response.bodyAsText())
    }

    suspend fun getById(id: String): BlogPost =
        client.getApi("api/blog") {
            parameter("id", id)
        }

    suspend fun getBySlugOrId(segment: String): BlogPost {
        val response = client.get("api/blog/$segment")
        if (!response.status.isSuccess()) {
            throw ApiException(response.status.value, response.bodyAsText())
        }
        return response.body()
    }

    suspend fun deletePost(id: String) {
        val response = client.delete("api/blog/$id")
        if (!response.status.isSuccess()) {
            throw ApiException(response.status.value, response.bodyAsText())
        }
    }

    suspend fun addComment(postId: String, body: String, authorName: String): BlogComment =
        client.postApi(
            "api/blog/$postId/comments",
            buildJsonObject {
                put("body", body)
                put("authorName", authorName)
            },
        )

    suspend fun deleteComment(postId: String, commentId: String) {
        val response = client.delete("api/blog/$postId/comments") {
            parameter("commentId", commentId)
        }
        if (!response.status.isSuccess()) {
            throw ApiException(response.status.value, response.bodyAsText())
        }
    }
}
