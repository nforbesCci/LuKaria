package com.lukariagroup.app.core

import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSThread
import platform.Foundation.NSURL
import platform.UIKit.UIApplication
import platform.darwin.dispatch_async
import platform.darwin.dispatch_get_main_queue

@OptIn(ExperimentalForeignApi::class)
actual fun openWhatsAppChat(phoneE164: String) {
    val digits = phoneE164.filter { it.isDigit() }
    if (digits.isEmpty()) return

    fun open(urlString: String) {
        val nsUrl = NSURL.URLWithString(urlString) ?: return
        UIApplication.sharedApplication.openURL(
            nsUrl,
            options = emptyMap<Any?, Any>(),
            completionHandler = null,
        )
    }

    fun run() {
        val app = UIApplication.sharedApplication
        val native = NSURL.URLWithString("whatsapp://send?phone=$digits")
        if (native != null && app.canOpenURL(native)) {
            open("whatsapp://send?phone=$digits")
        } else {
            open("https://wa.me/$digits")
        }
    }

    if (NSThread.isMainThread) {
        run()
    } else {
        dispatch_async(dispatch_get_main_queue()) { run() }
    }
}
