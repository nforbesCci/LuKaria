package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import platform.Foundation.NSLog

@Composable
actual fun rememberBarcodeScannerLauncher(
    onResult: (String?) -> Unit,
): () -> Unit {
    return remember(onResult) {
        {
            val presenter = BarcodeScannerHost.presenter
            if (presenter == null) {
                NSLog("BarcodeScannerHost.presenter is not installed — ensure BarcodeScannerBridge.install() runs.")
                onResult(null)
            } else {
                presenter.present(
                    object : BarcodeScannerCompletion {
                        override fun onComplete(barcode: String?) {
                            onResult(barcode?.takeIf { it.isNotBlank() })
                        }
                    },
                )
            }
        }
    }
}
