package com.lukariagroup.app.core

import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.cio.CIO

/**
 * iOS simulator: point PlatformConfig at https://localhost:3000 and trust the
 * local CA in the simulator keychain if needed. Release uses system trust store.
 */
actual fun createPlatformHttpClient(block: HttpClientConfig<*>.() -> Unit): HttpClient =
    HttpClient(CIO, block)
