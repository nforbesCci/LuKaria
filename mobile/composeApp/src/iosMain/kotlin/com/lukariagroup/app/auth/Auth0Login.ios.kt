package com.lukariagroup.app.auth

import com.lukariagroup.app.core.PlatformConfig
import platform.Foundation.NSUUID
import platform.Foundation.NSURL
import platform.UIKit.UIApplication

actual fun openAuth0Login() {
    val domain = PlatformConfig.auth0Domain.trimEnd('/')
    val nonce = NSUUID().UUIDString
    val params = mutableListOf(
        "client_id=${PlatformConfig.auth0ClientId}",
        "response_type=id_token%20token",
        "redirect_uri=${PlatformConfig.auth0CallbackUrl}",
        "scope=openid%20profile%20email",
        "nonce=$nonce",
        "response_mode=fragment",
    )
    if (PlatformConfig.auth0Audience.isNotBlank()) {
        params += "audience=${PlatformConfig.auth0Audience}"
    }
    val urlString = "https://$domain/authorize?" + params.joinToString("&")
    val url = NSURL.URLWithString(urlString) ?: return
    UIApplication.sharedApplication.openURL(url)
}
