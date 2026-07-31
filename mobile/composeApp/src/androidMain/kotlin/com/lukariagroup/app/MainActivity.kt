package com.lukariagroup.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.lukariagroup.app.auth.handleAuth0CallbackUrl

/**
 * Android entry point.
 *
 * Deep link: lukaria://callback#access_token=… (Auth0 implicit / SPA style)
 * or lukaria://callback?code=… (authorization code — exchange TBD).
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
        handleAuth0CallbackUrl(data.toString())
    }
}
