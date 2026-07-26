package com.lukariagroup.app.data.repository

import com.lukariagroup.app.core.ApiClient
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.serialization.json.JsonElement

class ApiException(val status: Int, message: String) : Exception(message)

suspend inline fun <reified T> HttpClient.getApi(path: String, block: io.ktor.client.request.HttpRequestBuilder.() -> Unit = {}): T {
    val response: HttpResponse = get(path.trimStart('/'), block)
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.postApi(path: String, body: Any? = null): T {
    val response: HttpResponse = post(path.trimStart('/')) {
        if (body != null) setBody(body)
    }
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.putApi(path: String, body: Any? = null): T {
    val response: HttpResponse = put(path.trimStart('/')) {
        if (body != null) setBody(body)
    }
    return response.parseBody()
}

suspend inline fun <reified T> HttpClient.deleteApi(path: String, body: Any? = null): T {
    val response: HttpResponse = delete(path.trimStart('/')) {
        if (body != null) setBody(body)
    }
    return response.parseBody()
}

suspend inline fun <reified T> HttpResponse.parseBody(): T {
    if (!status.isSuccess()) {
        val text = runCatching { bodyAsText() }.getOrDefault("")
        throw ApiException(status.value, text.ifBlank { "HTTP ${status.value}" })
    }
    return body()
}

fun HttpClient.asJsonElement(raw: String): JsonElement =
    ApiClient.json.parseToJsonElement(raw)
