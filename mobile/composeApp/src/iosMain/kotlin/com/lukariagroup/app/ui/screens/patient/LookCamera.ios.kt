package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import platform.Foundation.NSLog

@Composable
actual fun rememberLookCameraLauncher(
    onResult: (LookCameraCapture) -> Unit,
): () -> Unit {
    return remember(onResult) {
        {
            val presenter = LookCameraHost.presenter
            if (presenter == null) {
                NSLog("LookCameraHost.presenter is not installed — open iosApp and ensure LookCameraBridge.install() runs.")
                onResult(LookCameraCapture(frontDataUrl = null, sideDataUrl = null))
            } else {
                presenter.present(
                    object : LookCameraCompletion {
                        override fun onComplete(frontDataUrl: String?, sideDataUrl: String?) {
                            onResult(
                                LookCameraCapture(
                                    frontDataUrl = frontDataUrl,
                                    sideDataUrl = sideDataUrl,
                                ),
                            )
                        }
                    },
                )
            }
        }
    }
}
