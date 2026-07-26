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

    fun loginWithAccessToken(token: String): SessionUser {
        val cleaned = token.trim()
        require(cleaned.isNotBlank()) { "Access token is blank" }
        tokenStore.setAccessToken(cleaned)
        _accessToken.value = cleaned
        val user = JwtPayloadDecoder.decodeUser(cleaned)
            ?: SessionUser(sub = "dev-user", name = "Dev User", email = "dev@lukariagroup.com")
        _user.value = user
        return user
    }

    fun logout() {
        tokenStore.clear()
        _accessToken.value = null
        _user.value = null
    }

    fun currentUser(): SessionUser? = _user.value
}
