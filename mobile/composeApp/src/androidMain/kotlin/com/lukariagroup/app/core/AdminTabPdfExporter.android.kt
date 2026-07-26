package com.lukariagroup.app.core

import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.lukariagroup.app.AndroidAppContext
import java.io.File
import java.io.FileOutputStream

actual fun exportAdminTabPdf(
    title: String,
    patientName: String,
    sections: List<AdminPdfSection>,
): String {
    val context = AndroidAppContext.getOrNull()
        ?: return "Unable to export PDF (no app context)"

    val doc = PdfDocument()
    val pageWidth = 612
    val pageHeight = 792
    val margin = 40f
    val titlePaint = Paint().apply {
        color = Color.BLACK
        textSize = 18f
        isFakeBoldText = true
        isAntiAlias = true
    }
    val headingPaint = Paint().apply {
        color = Color.BLACK
        textSize = 14f
        isFakeBoldText = true
        isAntiAlias = true
    }
    val bodyPaint = Paint().apply {
        color = Color.DKGRAY
        textSize = 11f
        isAntiAlias = true
    }

    val lines = mutableListOf<Pair<Paint, String>>()
    lines += titlePaint to title
    lines += bodyPaint to "Patient: ${patientName.ifBlank { "—" }}"
    lines += bodyPaint to ""
    sections.forEach { section ->
        lines += headingPaint to section.heading
        section.body.lineSequence().forEach { line ->
            wrapLine(line, bodyPaint, pageWidth - margin * 2).forEach { wrapped ->
                lines += bodyPaint to wrapped
            }
        }
        lines += bodyPaint to ""
    }

    var pageNumber = 1
    var y = margin
    var pageInfo = doc.startPage(PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create())
    var canvas: Canvas = pageInfo.canvas

    fun newPage() {
        doc.finishPage(pageInfo)
        pageNumber++
        pageInfo = doc.startPage(PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create())
        canvas = pageInfo.canvas
        y = margin
    }

    for ((paint, text) in lines) {
        val lineHeight = paint.textSize + 6f
        if (y + lineHeight > pageHeight - margin) newPage()
        canvas.drawText(text.take(120), margin, y + paint.textSize, paint)
        y += lineHeight
    }
    doc.finishPage(pageInfo)

    val fileName = "lukaria-${title.replace(Regex("[^A-Za-z0-9]+"), "-").lowercase().take(40)}.pdf"
    val outFile = File(context.cacheDir, fileName)
    FileOutputStream(outFile).use { doc.writeTo(it) }
    doc.close()

    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", outFile)
    val share = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_SUBJECT, title)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(Intent.createChooser(share, "Share PDF").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    return "PDF ready to share"
}

private fun wrapLine(text: String, paint: Paint, maxWidth: Float): List<String> {
    if (text.isEmpty()) return listOf("")
    val words = text.split(' ')
    val result = mutableListOf<String>()
    var current = StringBuilder()
    for (word in words) {
        val candidate = if (current.isEmpty()) word else "$current $word"
        if (paint.measureText(candidate) <= maxWidth) {
            current = StringBuilder(candidate)
        } else {
            if (current.isNotEmpty()) result += current.toString()
            current = StringBuilder(word)
        }
    }
    if (current.isNotEmpty()) result += current.toString()
    return result.ifEmpty { listOf("") }
}
