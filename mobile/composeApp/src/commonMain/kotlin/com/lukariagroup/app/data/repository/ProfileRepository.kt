package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.data.models.ProfileResponse
import io.ktor.client.HttpClient
import kotlinx.serialization.json.JsonObject

class ProfileRepository(private val client: HttpClient) {
    suspend fun fetch(): ProfileResponse =
        client.getApi("api/profile/fetch")

    suspend fun save(profile: PatientProfile): ProfileResponse =
        client.postApi("api/profile/save", profile)

    suspend fun save(profile: JsonObject): ProfileResponse =
        client.postApi("api/profile/save", profile)
}
