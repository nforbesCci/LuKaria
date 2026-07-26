package com.lukariagroup.app.core

actual object PlatformConfig {
    /** Simulator: local HTTPS Next.js. Device builds should use a reachable host + trusted cert. */
    actual val apiBaseUrl: String = "https://localhost:3000"
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
        "https://calendly.com"
}
