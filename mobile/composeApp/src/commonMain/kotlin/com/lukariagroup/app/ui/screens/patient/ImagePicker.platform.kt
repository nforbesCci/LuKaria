package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable

/**
 * Returns a launcher that opens the platform image picker.
 * [onResult] receives a `data:image/...;base64,...` string, or null if cancelled.
 */
@Composable
expect fun rememberImageDataUrlPicker(onResult: (String?) -> Unit): () -> Unit
