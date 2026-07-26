package com.lukariagroup.app.core

data class AdminPdfSection(
    val heading: String,
    val body: String,
)

/**
 * Build a simple multi-page PDF from plain sections and open the platform share sheet.
 * Returns a short status message for toast/UI, or null if share was started silently.
 */
expect fun exportAdminTabPdf(
    title: String,
    patientName: String,
    sections: List<AdminPdfSection>,
): String
