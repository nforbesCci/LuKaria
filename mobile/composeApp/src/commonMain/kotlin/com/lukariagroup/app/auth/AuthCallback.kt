package com.lukariagroup.app.auth

import com.lukariagroup.app.AppContainer
import io.ktor.http.decodeURLPart

/**
 * Parses Auth0 redirect URLs (`lukaria://callback#access_token=…&id_token=…`)
 * and stores the session. Used by Android MainActivity and iOS onOpenURL.
 *
 * Prefers [id_token] for Bearer + display name: it carries profile claims and is
 * accepted by the API via AUTH0_NATIVE_CLIENT_ID. Access tokens for a custom API
 * audience usually omit name/email and 401 if AUTH0_AUDIENCE is missing in prod.
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
    // Do not let query overwrite fragment keys that are already set.
    val params = parseParams(query) + parseParams(fragment)
    val idToken = params["id_token"]?.takeIf { it.isNotBlank() }
    val accessToken = params["access_token"]?.takeIf { it.isNotBlank() }
    if (idToken == null && accessToken == null) return false

    AppContainer.authRepository.loginWithAuth0Tokens(
        accessToken = accessToken,
        idToken = idToken,
    )
    return true
}
