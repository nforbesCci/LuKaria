package com.lukariagroup.app.core

import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSString
import platform.Foundation.NSTemporaryDirectory
import platform.Foundation.NSURL
import platform.Foundation.NSUTF8StringEncoding
import platform.Foundation.writeToFile
import platform.UIKit.UIActivityViewController
import platform.UIKit.UIApplication

/**
 * iOS: share a plain-text report (PDF kit wiring is fragile across Kotlin/Native versions).
 * Content mirrors Android PDF sections for clinician export.
 */
@OptIn(ExperimentalForeignApi::class)
actual fun exportAdminTabPdf(
    title: String,
    patientName: String,
    sections: List<AdminPdfSection>,
): String {
    val safeTitle = title.replace(Regex("[^A-Za-z0-9]+"), "-").lowercase().take(40)
    val path = NSTemporaryDirectory() + "lukaria-$safeTitle.txt"
    val content = buildString {
        appendLine(title)
        appendLine("Patient: ${patientName.ifBlank { "—" }}")
        appendLine()
        sections.forEach { section ->
            appendLine(section.heading)
            appendLine(section.body)
            appendLine()
        }
    }
    (content as NSString).writeToFile(path, atomically = true, encoding = NSUTF8StringEncoding, error = null)

    val url = NSURL.fileURLWithPath(path)
    val root = UIApplication.sharedApplication.keyWindow?.rootViewController
        ?: return "Export saved to temporary file"
    val activity = UIActivityViewController(activityItems = listOf(url), applicationActivities = null)
    root.presentViewController(activity, animated = true, completion = null)
    return "Report ready to share"
}
