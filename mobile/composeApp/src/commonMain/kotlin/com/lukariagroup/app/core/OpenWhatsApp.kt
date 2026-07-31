package com.lukariagroup.app.core

/**
 * Opens a WhatsApp chat for an E.164 phone number (digits only or with +).
 * Prefers the native WhatsApp app when available, otherwise https://wa.me/.
 */
expect fun openWhatsAppChat(phoneE164: String)
