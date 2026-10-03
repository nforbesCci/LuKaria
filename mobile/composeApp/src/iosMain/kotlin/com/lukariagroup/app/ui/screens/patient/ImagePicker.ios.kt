package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import platform.Foundation.NSLog

@Composable
actual fun rememberImageDataUrlSources(onResult: (String?) -> Unit): ImageSourceLaunchers {
    val currentOnResult by rememberUpdatedState(onResult)
    return remember {
        val launch: (Boolean) -> Unit = { useCamera ->
            val presenter = ImagePickerHost.presenter
            if (presenter == null) {
                NSLog("ImagePickerHost.presenter is not installed — ensure ImagePickerBridge.install() runs in iOSApp.")
                currentOnResult(null)
            } else {
                presenter.present(
                    useCamera,
                    object : ImagePickerCompletion {
                        override fun onImagePicked(dataUrl: String?) {
                            currentOnResult(dataUrl)
                        }
                    },
                )
            }
        }
        ImageSourceLaunchers(
            takePhoto = { launch(true) },
            pickGallery = { launch(false) },
        )
    }
}
