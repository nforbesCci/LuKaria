package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable

/**
 * Launchers for capturing a new photo or picking one from the gallery.
 * [onResult] receives a `data:image/...;base64,...` string, or null if cancelled.
 */
data class ImageSourceLaunchers(
    val takePhoto: () -> Unit,
    val pickGallery: () -> Unit,
)

@Composable
expect fun rememberImageDataUrlSources(onResult: (String?) -> Unit): ImageSourceLaunchers

/**
 * Convenience launcher that opens the **camera** (primary meal-logging path).
 * Prefer [rememberImageDataUrlSources] when both camera and gallery are needed.
 */
@Composable
fun rememberImageDataUrlPicker(onResult: (String?) -> Unit): () -> Unit {
    val sources = rememberImageDataUrlSources(onResult)
    return sources.takePhoto
}
