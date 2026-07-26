package com.lukariagroup.app.core

import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig

/**
 * Platform HttpClient (CIO). Debug builds may trust the local Next.js self-signed cert.
 */
expect fun createPlatformHttpClient(block: HttpClientConfig<*>.() -> Unit): HttpClient
