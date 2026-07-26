package com.lukariagroup.app.ui.screens.patient

/**
 * Platform camera / barcode scanner entry point.
 * Returns a barcode string when a scan succeeds, or null if cancelled / unavailable.
 */
expect suspend fun scanBarcode(): String?
