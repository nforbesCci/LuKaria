package com.lukariagroup.app.core

import android.content.Intent
import android.net.Uri
import com.lukariagroup.app.AndroidAppContext

actual fun openWhatsAppChat(phoneE164: String) {
    val digits = phoneE164.filter { it.isDigit() }
    if (digits.isEmpty()) return
    val context = AndroidAppContext.getOrNull() ?: return

    // Prefer native WhatsApp; fall back to wa.me (opens app or browser).
    val candidates = listOf(
        "whatsapp://send?phone=$digits",
        "https://wa.me/$digits",
    )
    for (url in candidates) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
            return
        }
    }
    openExternalUrl("https://wa.me/$digits")
}
