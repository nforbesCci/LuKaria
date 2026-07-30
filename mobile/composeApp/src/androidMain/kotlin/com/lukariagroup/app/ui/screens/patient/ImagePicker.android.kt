package com.lukariagroup.app.ui.screens.patient

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import java.io.ByteArrayOutputStream

@Composable
actual fun rememberImageDataUrlPicker(onResult: (String?) -> Unit): () -> Unit {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent(),
    ) { uri ->
        if (uri == null) {
            onResult(null)
            return@rememberLauncherForActivityResult
        }
        runCatching {
            context.contentResolver.openInputStream(uri)?.use { input ->
                val original = BitmapFactory.decodeStream(input)
                    ?: error("Could not decode image")
                val maxSide = 1600
                val scaled = if (original.width > maxSide || original.height > maxSide) {
                    val ratio = minOf(
                        maxSide.toFloat() / original.width,
                        maxSide.toFloat() / original.height,
                    )
                    Bitmap.createScaledBitmap(
                        original,
                        (original.width * ratio).toInt().coerceAtLeast(1),
                        (original.height * ratio).toInt().coerceAtLeast(1),
                        true,
                    ).also { if (it !== original) original.recycle() }
                } else {
                    original
                }
                val out = ByteArrayOutputStream()
                scaled.compress(Bitmap.CompressFormat.JPEG, 85, out)
                if (scaled !== original) scaled.recycle()
                val b64 = Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
                "data:image/jpeg;base64,$b64"
            }
        }.onSuccess { dataUrl ->
            onResult(dataUrl)
        }.onFailure {
            onResult(null)
        }
    }
    return remember(launcher) { { launcher.launch("image/*") } }
}
