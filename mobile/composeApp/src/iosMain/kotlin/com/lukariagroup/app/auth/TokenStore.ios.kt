package com.lukariagroup.app.auth

import platform.Foundation.NSUserDefaults

actual class TokenStore actual constructor() {
    private var memory: String? = null
    private val defaults = NSUserDefaults.standardUserDefaults

    actual fun getAccessToken(): String? {
        if (memory != null) return memory
        memory = defaults.stringForKey(KEY)
        return memory
    }

    actual fun setAccessToken(token: String?) {
        memory = token
        if (token.isNullOrBlank()) {
            defaults.removeObjectForKey(KEY)
        } else {
            defaults.setObject(token, KEY)
        }
        defaults.synchronize()
    }

    actual fun clear() = setAccessToken(null)

    companion object {
        private const val KEY = "lukaria_access_token"
    }
}
