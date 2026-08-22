package com.lukariagroup.app.data.repository

import com.lukariagroup.app.core.ApiClient
import com.lukariagroup.app.core.SessionExpiredHandler
import io.ktor.client.HttpClient
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.content.TextContent
import io.ktor.http.isSuccess
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

class ApiException(val status: Int, message: String) : Exception(message)

suspend inline fun <reified T> HttpClient.getApi(
    path: String,
    block: HttpRequestBuilder.() -> Unit = {},
): T {
    val response: HttpResponse = get(path.trimStart('/'), block)
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.postApi(path: String, body: Any? = null): T {
    val response: HttpResponse = post(path.trimStart('/')) {
        applyApiBody(body)
    }
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.putApi(path: String, body: Any? = null): T {
    val response: HttpResponse = put(path.trimStart('/')) {
        applyApiBody(body)
    }
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.deleteApi(path: String, body: Any? = null): T {
    val response: HttpResponse = delete(path.trimStart('/')) {
        applyApiBody(body)
    }
    return response.parseBody()
}

/**
 * Encode bodies explicitly. Passing [JsonObject]/[JsonElement] through Ktor's
 * `setBody(Any)` fails with "Serializer for class 'JsonLiteral' is not found".
 */
fun HttpRequestBuilder.applyApiBody(body: Any?) {
    when (body) {
        null -> Unit
        is JsonElement -> setBody(
            TextContent(
                ApiClient.json.encodeToString(JsonElement.serializer(), body),
                ContentType.Application.Json,
            ),
        )
        else -> setBody(body)
    }
}

suspend inline fun <reified T> HttpResponse.parseBody(): T {
    val text = runCatching { bodyAsText() }.getOrDefault("")
    if (!status.isSuccess()) {
        if (status.value == 401) {
            SessionExpiredHandler.notifyUnauthorized()
        }
        val message = runCatching {
            val obj = ApiClient.json.parseToJsonElement(text) as? JsonObject
            listOf("error", "message", "details")
                .mapNotNull { key -> (obj?.get(key) as? JsonPrimitive)?.contentOrNull }
                .firstOrNull { it.isNotBlank() }
        }.getOrNull()
            ?: when {
                status.value == 404 ->
                    "API not found (404). Deploy may be pending."
                text.isBlank() -> "HTTP ${status.value}"
                text.trimStart().startsWith("<") -> "Server error (${status.value})"
                else -> text.take(200)
            }
        throw ApiException(status.value, message)
    }
    return try {
        ApiClient.json.decodeFromString(text)
    } catch (e: Exception) {
        throw ApiException(
            status.value,
            e.message?.take(180) ?: "Invalid server response (${status.value})",
        )
    }
}

fun HttpClient.asJsonElement(raw: String): JsonElement =
    ApiClient.json.parseToJsonElement(raw)
