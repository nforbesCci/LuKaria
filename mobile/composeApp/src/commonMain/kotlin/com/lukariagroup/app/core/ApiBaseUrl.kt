package com.lukariagroup.app.core

private const val PRODUCTION_API_BASE_URL = "https://www.lukariagroup.com"

/**
 * Normalize / harden API base URLs.
 *
 * `https://localhost` (no port) becomes HTTPS default port 443 and fails on device with
 * `Failed to connect InetSocketAddress(localhost:443)`. Map that mistake to :3000 for local
 * Next.js; anything blank or an unexpanded Xcode `$(…)` token falls back to production.
 */
fun resolveApiBaseUrl(raw: String?): String {
    val trimmed = raw?.trim()?.trimEnd('/')?.takeIf { it.isNotEmpty() } ?: return PRODUCTION_API_BASE_URL
    if (trimmed.contains("\$(")) return PRODUCTION_API_BASE_URL

    val localhostNoPort = Regex("""^https?://(localhost|127\.0\.0\.1)/?$""", RegexOption.IGNORE_CASE)
    if (localhostNoPort.matches(trimmed)) {
        val host = if (trimmed.contains("127.0.0.1", ignoreCase = true)) "127.0.0.1" else "localhost"
        val scheme = if (trimmed.startsWith("http://", ignoreCase = true)) "http" else "https"
        return "$scheme://$host:3000"
    }

    return trimmed
}

fun productionApiBaseUrl(): String = PRODUCTION_API_BASE_URL
