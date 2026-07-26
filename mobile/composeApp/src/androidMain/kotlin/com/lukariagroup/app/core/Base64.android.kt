package com.lukariagroup.app.core

import android.util.Base64

actual fun platformBase64Decode(base64: String): String =
    String(Base64.decode(base64, Base64.DEFAULT), Charsets.UTF_8)

actual fun platformBase64Encode(bytes: ByteArray): String =
    Base64.encodeToString(bytes, Base64.NO_WRAP)
