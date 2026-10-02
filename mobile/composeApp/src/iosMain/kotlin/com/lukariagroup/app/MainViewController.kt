package com.lukariagroup.app

import androidx.compose.ui.window.ComposeUIViewController
import com.lukariagroup.app.core.LaunchOverrides
import platform.Foundation.NSProcessInfo
import platform.UIKit.UIViewController

fun MainViewController(): UIViewController {
    val environment = NSProcessInfo.processInfo.environment
    LaunchOverrides.accessToken = environment["LUKARIA_SCREENSHOT_TOKEN"] as? String
    LaunchOverrides.startRoute = environment["LUKARIA_SCREENSHOT_ROUTE"] as? String
    return ComposeUIViewController { App() }
}
