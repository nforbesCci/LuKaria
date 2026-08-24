package com.lukariagroup.app.core

import platform.Foundation.NSBundle

actual object PlatformConfig {
    /** Production by default; override via Info.plist key API_BASE_URL for local/dev builds. */
    actual val apiBaseUrl: String =
        resolveApiBaseUrl(
            NSBundle.mainBundle.objectForInfoDictionaryKey("API_BASE_URL") as? String,
        )

    /** Custom Auth0 domain (login + JWKS). */
    actual val auth0Domain: String = "auth.lukariagroup.com"
    /** Auth0 Native application "Lukaria Mobile". */
    actual val auth0ClientId: String = "qk0jGuhj1EGWiq3E2Jdg5KtxgQXT5kaP"
    /** Auth0 API identifier (resource server). */
    actual val auth0Audience: String = "https://www.lukariagroup.com/api"
    actual val auth0CallbackUrl: String = "lukaria://callback"
    actual val carepatronBookingUrl: String =
        "https://book.carepatron.com/Svelte-by-LuKaria/Kadria?p=r9RnLSo5RHyHR3fgw8hd.Q&s=OxGL.h4Z&i=PRIJX0DU&e=i"
    actual val calendlyBookingUrl: String =
        "https://calendly.com/kadriaf-lukariagroup/30min"
}
