package com.lukariagroup.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

/**
 * Android entry point.
 *
 * Deep link: lukaria://callback#access_token=… (Auth0 implicit / SPA style)
 * or lukaria://callback?code=… (authorization code — exchange TBD).
 *
 * Wire Auth0 Custom Tabs / AppAuth here when native login is fully enabled.
 * Until then, LoginScreen accepts a pasted access token for development.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        AndroidAppContext.init(applicationContext)
        handleAuthCallback(intent)
        setContent {
            App()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleAuthCallback(intent)
    }

    private fun handleAuthCallback(intent: Intent?) {
        val data: Uri = intent?.data ?: return
        if (data.scheme != "lukaria") return

        // Fragment-style tokens: lukaria://callback#access_token=...&token_type=Bearer
        val fragment = data.fragment.orEmpty()
        val fromFragment = fragment.split("&")
            .mapNotNull {
                val parts = it.split("=", limit = 2)
                if (parts.size == 2) parts[0] to Uri.decode(parts[1]) else null
            }
            .toMap()
        // Prefer API access_token (audience JWT); fall back to id_token
        val token = fromFragment["access_token"]
            ?: fromFragment["id_token"]
            ?: data.getQueryParameter("access_token")
            ?: data.getQueryParameter("id_token")
        if (!token.isNullOrBlank()) {
            AppContainer.authRepository.loginWithAccessToken(token)
        }
    }
}
