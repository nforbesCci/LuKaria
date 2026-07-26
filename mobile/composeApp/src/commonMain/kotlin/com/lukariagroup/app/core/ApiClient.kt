package com.lukariagroup.app.core

import com.lukariagroup.app.auth.TokenStore
import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.header
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object ApiClient {
    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
        explicitNulls = false
    }

    fun create(tokenStore: TokenStore): HttpClient = createPlatformHttpClient {
        expectSuccess = false

        install(ContentNegotiation) {
            json(json)
        }

        install(Logging) {
            logger = object : Logger {
                override fun log(message: String) {
                    println("Ktor: $message")
                }
            }
            level = LogLevel.INFO
        }

        install(Auth) {
            bearer {
                loadTokens {
                    tokenStore.getAccessToken()?.let { BearerTokens(it, "") }
                }
                refreshTokens {
                    tokenStore.getAccessToken()?.let { BearerTokens(it, "") }
                }
                sendWithoutRequest { true }
            }
        }

        defaultRequest {
            url(PlatformConfig.apiBaseUrl.trimEnd('/') + "/")
            contentType(ContentType.Application.Json)
            header(HttpHeaders.Accept, ContentType.Application.Json.toString())
            // Explicit Bearer — Auth plugin alone can skip the header on first 401 paths
            tokenStore.getAccessToken()?.let { token ->
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        }
    }
}
