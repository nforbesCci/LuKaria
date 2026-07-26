package com.lukariagroup.app.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas as AndroidCanvas
import android.graphics.Paint
import android.graphics.Path as AndroidPath
import com.lukariagroup.app.core.platformBase64Encode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

actual suspend fun encodeSignatureToPngDataUrl(
    strokes: List<SignatureStroke>,
    width: Int,
    height: Int,
): String = withContext(Dispatchers.Default) {
    val w = width.coerceAtLeast(1)
    val h = height.coerceAtLeast(1)
    val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    val canvas = AndroidCanvas(bitmap)
    canvas.drawColor(android.graphics.Color.WHITE)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = android.graphics.Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = 4f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    strokes.forEach { stroke ->
        if (stroke.points.isEmpty()) return@forEach
        val path = AndroidPath()
        path.moveTo(stroke.points.first().x, stroke.points.first().y)
        stroke.points.drop(1).forEach { path.lineTo(it.x, it.y) }
        canvas.drawPath(path, paint)
    }
    val out = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
    bitmap.recycle()
    "data:image/png;base64,${platformBase64Encode(out.toByteArray())}"
}
