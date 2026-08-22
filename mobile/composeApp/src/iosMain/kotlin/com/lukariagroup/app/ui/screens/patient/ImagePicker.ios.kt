package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

/**
 * iOS camera / gallery can be wired with UIImagePickerController.
 * Until then, callers should show a clear message when the result is null.
 */
@Composable
actual fun rememberImageDataUrlSources(onResult: (String?) -> Unit): ImageSourceLaunchers {
    return remember {
        ImageSourceLaunchers(
            takePhoto = { onResult(null) },
            pickGallery = { onResult(null) },
        )
    }
}
