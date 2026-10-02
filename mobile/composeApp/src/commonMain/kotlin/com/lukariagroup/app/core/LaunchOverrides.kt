package com.lukariagroup.app.core

/**
 * Optional sign-in token and start screen supplied by the launcher (e.g. simulator
 * environment variables when capturing App Store screenshots). Users cannot set these.
 */
object LaunchOverrides {
    var accessToken: String? = null
    var startRoute: String? = null
}
