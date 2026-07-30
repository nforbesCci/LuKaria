package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable

/**
 * Result from the 3DLOOK AI camera capture flow (front + side guided photos).
 */
data class LookCameraCapture(
    val frontDataUrl: String?,
    val sideDataUrl: String?,
)

/**
 * Launches the 3DLOOK AI camera for guided front/side capture.
 * Android: look-camera-sdk SdkActivity
 * iOS: LookCamera SDK (https://github.com/3dlook-me/ios_sdk_public)
 * On failure / cancel, [onResult] receives null photo URLs.
 */
@Composable
expect fun rememberLookCameraLauncher(
    onResult: (LookCameraCapture) -> Unit,
): () -> Unit
