package com.lukariagroup.app.core

private const val PRODUCTION_API_BASE_URL = "https://www.lukariagroup.com"

/**
 * Normalize / harden API base URLs.
 *
 * Common failure modes that become `InetSocketAddress(localhost:443)` on device:
 * - Xcode xcconfig truncates `https://host` to `https:` because `//` starts a comment
 * - Bare `https://localhost` (no port) defaults to HTTPS port 443
 * - Unexpanded Info.plist `$(API_BASE_URL)` tokens
 *
 * Map bare localhost to :3000 for local Next.js; anything blank/invalid → production.
 */
fun resolveApiBaseUrl(raw: String?): String {
    val trimmed = raw?.trim()?.trimEnd('/')?.takeIf { it.isNotEmpty() } ?: return PRODUCTION_API_BASE_URL
    if (trimmed.contains("\$(")) return PRODUCTION_API_BASE_URL

    // Truncated xcconfig URL (https: or http:) — no host left after // comment strip.
    if (trimmed.equals("https:", ignoreCase = true) || trimmed.equals("http:", ignoreCase = true)) {
        return PRODUCTION_API_BASE_URL
    }

    val localhostNoPort = Regex("""^https?://(localhost|127\.0\.0\.1)/?$""", RegexOption.IGNORE_CASE)
    if (localhostNoPort.matches(trimmed)) {
        val host = if (trimmed.contains("127.0.0.1", ignoreCase = true)) "127.0.0.1" else "localhost"
        val scheme = if (trimmed.startsWith("http://", ignoreCase = true)) "http" else "https"
        return "$scheme://$host:3000"
    }

    // Require a real host (scheme://host…) so relative Ktor defaults never hit localhost:443.
    val hasHost = Regex("""^https?://[^/\s]+""", RegexOption.IGNORE_CASE).containsMatchIn(trimmed)
    if (!hasHost) return PRODUCTION_API_BASE_URL

    return trimmed
}

fun productionApiBaseUrl(): String = PRODUCTION_API_BASE_URL
