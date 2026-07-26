package com.lukariagroup.app.core

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import platform.Foundation.NSData
import platform.Foundation.NSString
import platform.Foundation.NSUTF8StringEncoding
import platform.Foundation.base64EncodedStringWithOptions
import platform.Foundation.create
import platform.Foundation.initWithBase64EncodedString

@OptIn(ExperimentalForeignApi::class)
actual fun platformBase64Decode(base64: String): String {
    val data = NSData.create(base64EncodedString = base64, options = 0u) ?: return ""
    return NSString.create(data = data, encoding = NSUTF8StringEncoding)?.toString().orEmpty()
}

@OptIn(ExperimentalForeignApi::class)
actual fun platformBase64Encode(bytes: ByteArray): String {
    if (bytes.isEmpty()) return ""
    val nsData = bytes.usePinned { pinned ->
        NSData.create(bytes = pinned.addressOf(0), length = bytes.size.toULong())
    }
    return nsData.base64EncodedStringWithOptions(0u)
}
