package com.lukariagroup.app.ui.screens.patient

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import com.look.camera.sdk.SdkActivity
import com.look.camera.sdk.data.LaunchOption

private fun Context.findActivity(): Activity? {
    var current: Context = this
    while (current is ContextWrapper) {
        if (current is Activity) return current
        current = current.baseContext
    }
    return null
}

@Composable
actual fun rememberLookCameraLauncher(
    onResult: (LookCameraCapture) -> Unit,
): () -> Unit {
    val context = LocalContext.current
    val activity = remember(context) { context.findActivity() }
    var pendingLaunch by remember { mutableStateOf(false) }

    val sdkLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        if (result.resultCode != Activity.RESULT_OK) {
            onResult(LookCameraCapture(frontDataUrl = null, sideDataUrl = null))
            return@rememberLauncherForActivityResult
        }
        val data = result.data
        val frontUri = SdkActivity.getFrontPhotoUri(data)
        val sideUri = SdkActivity.getSidePhotoUri(data)
        onResult(
            LookCameraCapture(
                frontDataUrl = uriToJpegDataUrl(context, frontUri),
                sideDataUrl = uriToJpegDataUrl(context, sideUri),
            ),
        )
    }

    fun startSdk() {
        val host = activity ?: run {
            onResult(LookCameraCapture(null, null))
            return
        }
        val intent = SdkActivity.start(host, LaunchOption.START_FROM_TUTORIAL)
        sdkLauncher.launch(intent)
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) {
            startSdk()
        } else {
            onResult(LookCameraCapture(null, null))
        }
        pendingLaunch = false
    }

    return remember(sdkLauncher, permissionLauncher, activity) {
        {
            val host = activity
            if (host == null) {
                onResult(LookCameraCapture(null, null))
                return@remember
            }
            val granted = ContextCompat.checkSelfPermission(
                host,
                Manifest.permission.CAMERA,
            ) == PackageManager.PERMISSION_GRANTED
            if (granted) {
                startSdk()
            } else {
                pendingLaunch = true
                permissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }
}
