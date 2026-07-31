package com.lukariagroup.app.auth

import com.lukariagroup.app.core.PlatformConfig
import io.ktor.http.encodeURLParameter
import platform.Foundation.NSUUID
import platform.Foundation.NSURL
import platform.UIKit.UIApplication

actual fun openAuth0Login() {
    val domain = PlatformConfig.auth0Domain.trimEnd('/')
    // Encode query values — unencoded "://" in redirect_uri/audience breaks NSURL parsing.
    fun enc(value: String): String = value.encodeURLParameter()

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
