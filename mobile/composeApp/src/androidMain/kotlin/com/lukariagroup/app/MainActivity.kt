package com.lukariagroup.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.lukariagroup.app.auth.handleAuth0CallbackUrl
import com.lukariagroup.app.core.ensureNotificationPermission

/**
 * Android entry point.
 *
 * Deep link: lukaria://callback#access_token=… (Auth0 implicit / SPA style)
 * or lukaria://callback?code=… (authorization code — exchange TBD).
 */
class MainActivity : ComponentActivity() {
    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        AndroidAppContext.init(applicationContext)
        ensureNotificationPermission()
        requestNotificationPermissionIfNeeded()
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

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun handleAuthCallback(intent: Intent?) {
        val data: Uri = intent?.data ?: return
        handleAuth0CallbackUrl(data.toString())
    }
}
