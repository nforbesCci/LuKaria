package com.lukariagroup.app.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class SessionUser(
    val sub: String = "",
    val email: String? = null,
    val name: String? = null,
    val nickname: String? = null,
    val picture: String? = null,
    val groups: List<String> = emptyList(),
    @SerialName(Roles.CLAIM)
    val rolesClaim: List<String> = emptyList(),
) {
    val roles: Set<String>
        get() = Roles.fromClaims(if (rolesClaim.isNotEmpty()) rolesClaim else groups)

    val isAdmin: Boolean get() = Roles.isAdmin(roles)
    val isDoctor: Boolean get() = Roles.isDoctor(roles)
    val isStaff: Boolean get() = Roles.isStaff(roles)
    val isPatient: Boolean get() = Roles.isPatient(roles)

    val displayName: String
        get() = name?.takeIf { it.isNotBlank() }
            ?: nickname?.takeIf { it.isNotBlank() }
            ?: email?.takeIf { it.isNotBlank() }
            ?: "Member"
}

/**
 * Minimal JWT payload decode (no signature verification — server validates).
 * Used only to hydrate [SessionUser] after login / token paste.
 */
object JwtPayloadDecoder {
    fun decodeUser(accessToken: String): SessionUser? {
        val parts = accessToken.split(".")
        if (parts.size < 2) return null
        return try {
            val json = decodeBase64Url(parts[1])
            val map = JsonLenient.parseToJsonElement(json)
            val obj = map.jsonObjectOrNull() ?: return null
            val roles = obj.stringList(Roles.CLAIM)
                .ifEmpty { obj.stringList("roles") }
                .ifEmpty { obj.stringList("groups") }
            SessionUser(
                sub = obj.string("sub").orEmpty(),
                email = obj.string("email") ?: obj.string("https://lukariagroup.com/email"),
                name = obj.string("name"),
                nickname = obj.string("nickname"),
                picture = obj.string("picture"),
                groups = roles,
                rolesClaim = roles,
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun decodeBase64Url(value: String): String {
        val padded = when (value.length % 4) {
            2 -> "$value=="
            3 -> "$value="
            else -> value
        }.replace('-', '+').replace('_', '/')
        return platformBase64Decode(padded)
    }
}

expect fun platformBase64Decode(base64: String): String
expect fun platformBase64Encode(bytes: ByteArray): String

internal object JsonLenient {
    val json = kotlinx.serialization.json.Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    fun parseToJsonElement(raw: String): JsonElement = json.parseToJsonElement(raw)
}

private fun JsonElement.jsonObjectOrNull() =
    this as? kotlinx.serialization.json.JsonObject

private fun kotlinx.serialization.json.JsonObject.string(key: String): String? {
    val el = this[key] ?: return null
    return when (el) {
        is kotlinx.serialization.json.JsonPrimitive -> el.content
        else -> null
    }
}

private fun kotlinx.serialization.json.JsonObject.stringList(key: String): List<String> {
    val el = this[key] ?: return emptyList()
    return when (el) {
        is kotlinx.serialization.json.JsonArray -> el.mapNotNull {
            (it as? kotlinx.serialization.json.JsonPrimitive)?.content
        }
        is kotlinx.serialization.json.JsonPrimitive -> listOf(el.content)
        else -> emptyList()
    }
}
