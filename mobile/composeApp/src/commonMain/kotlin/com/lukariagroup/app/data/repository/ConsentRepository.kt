package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.ConsentPayload
import com.lukariagroup.app.data.models.ConsentResponse
import com.lukariagroup.app.data.models.ConsentType
import io.ktor.client.HttpClient

class ConsentRepository(private val client: HttpClient) {
    suspend fun fetch(type: ConsentType): ConsentResponse =
        client.getApi("api/consent/${type.pathSegment}/fetch")

    suspend fun save(type: ConsentType, payload: ConsentPayload): ConsentResponse =
        client.postApi("api/consent/${type.pathSegment}/save", payload)

    suspend fun fetchAll(): Map<ConsentType, ConsentResponse> =
        ConsentType.entries.associateWith { type ->
            runCatching { fetch(type) }.getOrElse {
                ConsentResponse(success = false, error = it.message)
            }
        }
}
