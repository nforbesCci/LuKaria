package com.lukariagroup.app.ui.screens.patient

import androidx.compose.runtime.Composable

/**
 * Platform camera barcode scanner.
 * Invokes [onResult] with the scanned value, or null if cancelled / unavailable.
 */
@Composable
expect fun rememberBarcodeScannerLauncher(
    onResult: (String?) -> Unit,
): () -> Unit
