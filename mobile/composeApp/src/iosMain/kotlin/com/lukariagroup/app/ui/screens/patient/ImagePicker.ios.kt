package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

/**
 * iOS gallery picker can be wired with UIImagePickerController later.
 * Until then, callers should show a clear message when the result is null.
 */
@Composable
actual fun rememberImageDataUrlPicker(onResult: (String?) -> Unit): () -> Unit {
    return remember {
        {
            onResult(null)
        }
    }
}
