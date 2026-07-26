package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.VideoItem
import com.lukariagroup.app.data.models.VideosResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class VideoRepository(private val client: HttpClient) {
    suspend fun list(): VideosResponse {
        val response = client.get("api/videos")
        val text = response.bodyAsText()
        if (!response.status.isSuccess()) {
            throw ApiException(response.status.value, text)
        }
        return runCatching {
            response.body<VideosResponse>()
        }.getOrElse {
            // Some backends return a raw array
            val element = com.lukariagroup.app.core.ApiClient.json.parseToJsonElement(text)
            val videos = when (element) {
                is JsonArray -> element.mapNotNull { el ->
                    val o = el.jsonObject
                    VideoItem(
                        id = o["id"]?.jsonPrimitive?.content,
                        name = o["name"]?.jsonPrimitive?.content,
                        webUrl = o["webUrl"]?.jsonPrimitive?.content,
                        downloadUrl = o["downloadUrl"]?.jsonPrimitive?.content,
                        thumbnailUrl = o["thumbnailUrl"]?.jsonPrimitive?.content,
                    )
                }
                is JsonObject -> element["videos"]?.jsonArray?.mapNotNull { el ->
                    val o = el.jsonObject
                    VideoItem(
                        id = o["id"]?.jsonPrimitive?.content,
                        name = o["name"]?.jsonPrimitive?.content,
                        webUrl = o["webUrl"]?.jsonPrimitive?.content,
                    )
                }.orEmpty()
                else -> emptyList()
            }
            VideosResponse(success = true, videos = videos)
        }
    }
}
