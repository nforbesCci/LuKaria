package com.lukariagroup.app.core

import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSThread
import platform.Foundation.NSURL
import platform.UIKit.UIApplication
import platform.darwin.dispatch_async
import platform.darwin.dispatch_get_main_queue

@OptIn(ExperimentalForeignApi::class)
actual fun openExternalUrl(url: String) {
    val nsUrl = NSURL.URLWithString(url.trim()) ?: return
    fun open() {
        // Deprecated openURL(_:) is a no-op / unreliable on modern iOS; use the options API.
        UIApplication.sharedApplication.openURL(
            nsUrl,
            options = emptyMap<Any?, Any>(),
            completionHandler = null,
        )
    }
    if (NSThread.isMainThread) {
        open()
    } else {
        dispatch_async(dispatch_get_main_queue()) { open() }
    }
}
