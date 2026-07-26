package com.lukariagroup.app.core

/**
 * Platform-specific configuration.
 * Override [apiBaseUrl] in local builds to point at staging or a device-reachable host.
 */
expect object PlatformConfig {
    val apiBaseUrl: String
    val auth0Domain: String
    val auth0ClientId: String
    val auth0Audience: String
    val auth0CallbackUrl: String
    val carepatronBookingUrl: String
    val calendlyBookingUrl: String
}
