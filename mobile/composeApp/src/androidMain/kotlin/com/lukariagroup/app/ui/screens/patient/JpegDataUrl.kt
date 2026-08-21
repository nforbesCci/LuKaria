package com.lukariagroup.app.ui.screens.patient

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.util.Base64
import androidx.exifinterface.media.ExifInterface
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/**
 * Load a content URI as an upright JPEG data URL for FitXpress.
 * Applies EXIF orientation (common cause of "Can not detect the human body")
 * and keeps enough resolution for body detection.
 */
internal fun uriToJpegDataUrl(context: Context, uri: Uri?): String? {
    if (uri == null) return null
    return runCatching {
        val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            ?: return null
        val decoded = BitmapFactory.decodeByteArray(bytes, 0, bytes.size) ?: return null
        val oriented = applyExifOrientation(decoded, bytes)
        val maxSide = 2048
        val scaled = if (oriented.width > maxSide || oriented.height > maxSide) {
            val ratio = minOf(
                maxSide.toFloat() / oriented.width,
                maxSide.toFloat() / oriented.height,
            )
            Bitmap.createScaledBitmap(
                oriented,
                (oriented.width * ratio).toInt().coerceAtLeast(1),
                (oriented.height * ratio).toInt().coerceAtLeast(1),
                true,
            ).also { if (it !== oriented) oriented.recycle() }
        } else {
            oriented
        }
        val out = ByteArrayOutputStream()
        scaled.compress(Bitmap.CompressFormat.JPEG, 92, out)
        if (scaled !== oriented) scaled.recycle()
        val b64 = Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
        "data:image/jpeg;base64,$b64"
    }.getOrNull()
}

private fun applyExifOrientation(bitmap: Bitmap, imageBytes: ByteArray): Bitmap {
    val orientation = runCatching {
        ExifInterface(ByteArrayInputStream(imageBytes))
            .getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
    }.getOrDefault(ExifInterface.ORIENTATION_NORMAL)

    val matrix = Matrix()
    when (orientation) {
        ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
        ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
        ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
        ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
        ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
        ExifInterface.ORIENTATION_TRANSPOSE -> {
            matrix.postRotate(90f)
            matrix.preScale(-1f, 1f)
        }
        ExifInterface.ORIENTATION_TRANSVERSE -> {
            matrix.postRotate(270f)
            matrix.preScale(-1f, 1f)
        }
        else -> return bitmap
    }
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
        .also { if (it !== bitmap) bitmap.recycle() }
}
