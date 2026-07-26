package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.AppointmentResponse
import io.ktor.client.HttpClient
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class AppointmentRepository(private val client: HttpClient) {
    suspend fun check(): AppointmentResponse =
        client.getApi("api/appointment/check")

    suspend fun save(body: JsonObject): AppointmentResponse =
        client.postApi("api/appointment/save", body)

    suspend fun update(body: JsonObject): AppointmentResponse =
        client.postApi("api/appointment/update", body)

    suspend fun requestReschedule(
        reason: String,
        preferredTimes: String = "",
    ): AppointmentResponse =
        client.postApi(
            "api/appointment/reschedule",
            buildJsonObject {
                put("reason", reason)
                put("preferredTimes", preferredTimes)
            },
        )
}
