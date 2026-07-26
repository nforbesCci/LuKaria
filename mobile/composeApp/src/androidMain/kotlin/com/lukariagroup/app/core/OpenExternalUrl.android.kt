package com.lukariagroup.app.core

import android.content.Intent
import android.net.Uri
import com.lukariagroup.app.AndroidAppContext

actual fun openExternalUrl(url: String) {
    val context = AndroidAppContext.getOrNull() ?: return
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
}
