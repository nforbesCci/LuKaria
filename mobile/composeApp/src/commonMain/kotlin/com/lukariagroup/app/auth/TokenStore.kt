package com.lukariagroup.app.auth

/**
 * Persists the Auth0 access token across process restarts.
 * In-memory cache + platform preferences (SharedPreferences / NSUserDefaults).
 */
expect class TokenStore() {
    fun getAccessToken(): String?
    fun setAccessToken(token: String?)
    fun clear()
}
