package com.lukariagroup.app.auth

import android.content.Context
import com.lukariagroup.app.AndroidAppContext

actual class TokenStore actual constructor() {
    private var memory: String? = null
    private val prefs by lazy {
        AndroidAppContext.require().getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    }

    actual fun getAccessToken(): String? {
        if (memory != null) return memory
        memory = prefs.getString(KEY, null)
        return memory
    }

    actual fun setAccessToken(token: String?) {
        memory = token
        prefs.edit().apply {
            if (token.isNullOrBlank()) remove(KEY) else putString(KEY, token)
        }.apply()
    }

    actual fun clear() = setAccessToken(null)

    companion object {
        private const val PREFS = "lukaria_auth"
        private const val KEY = "bearer_token_v2"
    }
}
