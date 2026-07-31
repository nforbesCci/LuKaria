package com.lukariagroup.app.auth

import com.lukariagroup.app.AppContainer
import io.ktor.http.decodeURLPart

/**
 * Parses Auth0 redirect URLs (`lukaria://callback#access_token=…` or query params)
 * and stores the session. Used by Android MainActivity and iOS onOpenURL.
 *
 * @return true if a token was found and stored
 */
fun handleAuth0CallbackUrl(url: String): Boolean {
    val trimmed = url.trim()
    if (trimmed.isEmpty()) return false
    if (!trimmed.startsWith("lukaria:", ignoreCase = true)) return false

    val hashIndex = trimmed.indexOf('#')
    val withoutFragment = if (hashIndex >= 0) trimmed.substring(0, hashIndex) else trimmed
    val fragment = if (hashIndex >= 0) trimmed.substring(hashIndex + 1) else ""

    val queryIndex = withoutFragment.indexOf('?')
    val query = if (queryIndex >= 0) withoutFragment.substring(queryIndex + 1) else ""

    fun parseParams(raw: String): Map<String, String> {
        if (raw.isBlank()) return emptyMap()
        return raw.split("&")
            .mapNotNull { part ->
                val idx = part.indexOf('=')
                if (idx <= 0) return@mapNotNull null
                val key = part.substring(0, idx)
                val value = part.substring(idx + 1).decodeURLPart()
                key to value
            }
            .toMap()
    }

    // Fragment-first (implicit flow), then query (code / alternate).
    val params = parseParams(fragment) + parseParams(query)
    val token = params["access_token"]
        ?: params["id_token"]
        ?: return false

    if (token.isBlank()) return false
    AppContainer.authRepository.loginWithAccessToken(token)
    return true
}
