package com.lukariagroup.app.auth

import com.lukariagroup.app.core.PlatformConfig
import platform.Foundation.NSCharacterSet
import platform.Foundation.NSUUID
import platform.Foundation.NSURL
import platform.Foundation.stringByAddingPercentEncodingWithAllowedCharacters
import platform.UIKit.UIApplication

actual fun openAuth0Login() {
    val domain = PlatformConfig.auth0Domain.trimEnd('/')
    // Encode query values strictly — unencoded "://" in redirect_uri/audience
    // can make NSURL.URLWithString return null (silent no-op) or Auth0 reject the request.
    val allowed = NSCharacterSet.characterSetWithCharactersInString(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",
    )
    fun enc(value: String): String =
        value.stringByAddingPercentEncodingWithAllowedCharacters(allowed) ?: value

    val params = buildList {
        add("client_id=${enc(PlatformConfig.auth0ClientId)}")
        add("response_type=${enc("id_token token")}")
        add("redirect_uri=${enc(PlatformConfig.auth0CallbackUrl)}")
        add("scope=${enc("openid profile email")}")
        add("nonce=${enc(NSUUID().UUIDString)}")
        add("response_mode=fragment")
        if (PlatformConfig.auth0Audience.isNotBlank()) {
            add("audience=${enc(PlatformConfig.auth0Audience)}")
        }
    }
    val url = NSURL.URLWithString("https://$domain/authorize?" + params.joinToString("&")) ?: return
    UIApplication.sharedApplication.openURL(
        url,
        options = emptyMap<Any?, Any>(),
        completionHandler = null,
    )
}
