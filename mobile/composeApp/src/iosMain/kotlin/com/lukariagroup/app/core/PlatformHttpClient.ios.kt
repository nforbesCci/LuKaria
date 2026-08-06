package com.lukariagroup.app.core

import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.darwin.Darwin

/**
 * iOS uses Darwin (NSURLSession). CIO does not support TLS on Kotlin/Native
 * ("TLS sessions are not supported on Native platform").
 */
actual fun createPlatformHttpClient(block: HttpClientConfig<*>.() -> Unit): HttpClient =
    HttpClient(Darwin, block)
