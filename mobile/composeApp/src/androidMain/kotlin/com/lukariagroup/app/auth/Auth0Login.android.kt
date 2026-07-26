package com.lukariagroup.app.auth

import android.content.Intent
import android.net.Uri
import com.lukariagroup.app.AndroidAppContext
import com.lukariagroup.app.core.PlatformConfig
import java.util.UUID

actual fun openAuth0Login() {
    val context = AndroidAppContext.getOrNull() ?: return
    val domain = PlatformConfig.auth0Domain.trimEnd('/')
    val builder = Uri.parse("https://$domain/authorize").buildUpon()
        .appendQueryParameter("client_id", PlatformConfig.auth0ClientId)
        // Prefer ID token for API Bearer auth until an Auth0 API audience exists
        .appendQueryParameter("response_type", "id_token token")
        .appendQueryParameter("redirect_uri", PlatformConfig.auth0CallbackUrl)
        .appendQueryParameter("scope", "openid profile email")
        .appendQueryParameter("nonce", UUID.randomUUID().toString())
        .appendQueryParameter("response_mode", "fragment")
    if (PlatformConfig.auth0Audience.isNotBlank()) {
        builder.appendQueryParameter("audience", PlatformConfig.auth0Audience)
    }
    context.startActivity(
        Intent(Intent.ACTION_VIEW, builder.build()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
    )
}
