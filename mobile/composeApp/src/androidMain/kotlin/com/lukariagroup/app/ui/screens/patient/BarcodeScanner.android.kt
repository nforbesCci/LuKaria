package com.lukariagroup.app.ui.screens.patient

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

private fun Context.findActivity(): Activity? {
    var current: Context = this
    while (current is ContextWrapper) {
        if (current is Activity) return current
        current = current.baseContext
    }
    return null
}

@Composable
actual fun rememberBarcodeScannerLauncher(
    onResult: (String?) -> Unit,
): () -> Unit {
    val context = LocalContext.current
    val activity = remember(context) { context.findActivity() }
    var pending by remember { mutableStateOf(false) }

    fun startScan() {
        val host = activity ?: run {
            onResult(null)
            return
        }
        val options = GmsBarcodeScannerOptions.Builder()
            .setBarcodeFormats(
                Barcode.FORMAT_EAN_13,
                Barcode.FORMAT_EAN_8,
                Barcode.FORMAT_UPC_A,
                Barcode.FORMAT_UPC_E,
                Barcode.FORMAT_CODE_128,
                Barcode.FORMAT_CODE_39,
                Barcode.FORMAT_QR_CODE,
            )
            .enableAutoZoom()
            .build()
        val scanner = GmsBarcodeScanning.getClient(host, options)
        scanner.startScan()
            .addOnSuccessListener { barcode ->
                onResult(barcode.rawValue?.takeIf { it.isNotBlank() })
            }
            .addOnCanceledListener {
                onResult(null)
            }
            .addOnFailureListener {
                onResult(null)
            }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) startScan() else onResult(null)
        pending = false
    }

    return remember(permissionLauncher, activity, onResult) {
        {
            val host = activity
            if (host == null) {
                onResult(null)
                return@remember
            }
            val granted = ContextCompat.checkSelfPermission(
                host,
                Manifest.permission.CAMERA,
            ) == PackageManager.PERMISSION_GRANTED
            if (granted) {
                startScan()
            } else if (!pending) {
                pending = true
                permissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }
}
