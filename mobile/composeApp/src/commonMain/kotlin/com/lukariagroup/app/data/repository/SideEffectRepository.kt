package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.SideEffectEntry
import com.lukariagroup.app.data.models.SideEffectsResponse
import io.ktor.client.HttpClient
import kotlinx.serialization.json.JsonObject

class SideEffectRepository(private val client: HttpClient) {
    suspend fun fetch(): SideEffectsResponse =
        client.getApi("api/side-effects/fetch")

    suspend fun save(entry: SideEffectEntry): SideEffectsResponse =
        client.postApi("api/side-effects/save", entry)

    suspend fun saveReport(body: JsonObject): SideEffectsResponse =
        client.postApi("api/side-effects/save", body)
}
