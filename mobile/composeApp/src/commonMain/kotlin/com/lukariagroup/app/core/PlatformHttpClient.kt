package com.lukariagroup.app.core

import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig

/**
 * Platform HttpClient — Android: CIO; iOS: Darwin (NSURLSession).
 * Debug Android builds may trust the local Next.js self-signed cert.
 */
expect fun createPlatformHttpClient(block: HttpClientConfig<*>.() -> Unit): HttpClient
