package com.lukariagroup.app.auth

import com.lukariagroup.app.core.JwtPayloadDecoder
import com.lukariagroup.app.core.SessionUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Opens Auth0 Universal Login via platform Custom Tabs / ASWebAuthenticationSession.
 * Stubbed for M0 — paste an access token on LoginScreen for development.
 */
expect fun openAuth0Login()

class AuthRepository(
    private val tokenStore: TokenStore,
) {
    private val _user = MutableStateFlow<SessionUser?>(null)
    val user: StateFlow<SessionUser?> = _user.asStateFlow()

    private val _accessToken = MutableStateFlow<String?>(null)
    val accessToken: StateFlow<String?> = _accessToken.asStateFlow()

    val isLoggedIn: Boolean get() = !_accessToken.value.isNullOrBlank()

    fun restoreSession() {
        val token = tokenStore.getAccessToken()
        _accessToken.value = token
        _user.value = token?.let { JwtPayloadDecoder.decodeUser(it) }
    }

    /**
     * Dev paste / single-token login. Prefer a JWT that includes profile claims
     * (typically the Auth0 id_token).
     */
    fun loginWithAccessToken(token: String): SessionUser =
        loginWithAuth0Tokens(accessToken = token, idToken = null)

    /**
     * Store a Bearer JWT for API calls and hydrate [SessionUser] from the richest
     * identity JWT available (id_token first).
     */
    fun loginWithAuth0Tokens(accessToken: String?, idToken: String?): SessionUser {
        val bearer = pickBearerToken(idToken = idToken, accessToken = accessToken)
        require(!bearer.isNullOrBlank()) { "Auth0 callback had no usable token" }

        tokenStore.setAccessToken(bearer)
        _accessToken.value = bearer

        val user = JwtPayloadDecoder.decodeUser(idToken ?: "")
            ?: JwtPayloadDecoder.decodeUser(accessToken ?: "")
            ?: JwtPayloadDecoder.decodeUser(bearer)
            ?: SessionUser(sub = "unknown", name = "Member")
        _user.value = user
        return user
    }

    fun logout() {
        tokenStore.clear()
        _accessToken.value = null
        _user.value = null
    }

    fun currentUser(): SessionUser? = _user.value

    companion object {
        /**
         * Prefer id_token: includes name/email and uses the native client as audience
         * (accepted via AUTH0_NATIVE_CLIENT_ID). Fall back to access_token.
         */
        fun pickBearerToken(idToken: String?, accessToken: String?): String? {
            val id = idToken?.trim()?.takeIf { it.isNotEmpty() && looksLikeJwt(it) }
            if (id != null) return id
            return accessToken?.trim()?.takeIf { it.isNotEmpty() }
        }

        private fun looksLikeJwt(token: String): Boolean =
            token.count { it == '.' } >= 2
    }
}
