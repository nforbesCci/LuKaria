package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.AppointmentResponse
import com.lukariagroup.app.data.models.AvailabilityResponse
import com.lukariagroup.app.data.models.BookAppointmentResponse
import com.lukariagroup.app.data.models.BookableTypesResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter
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

    suspend fun bookable(): BookableTypesResponse =
        client.getApi("api/appointment/bookable")

    suspend fun availability(
        eventTypeUri: String,
        start: String,
        end: String,
    ): AvailabilityResponse =
        client.getApi("api/appointment/availability") {
            parameter("eventTypeUri", eventTypeUri)
            parameter("start", start)
            parameter("end", end)
        }

    suspend fun book(
        eventTypeUri: String,
        startTime: String,
        typeName: String? = null,
        timezone: String? = null,
        forUserId: String? = null,
    ): BookAppointmentResponse =
        client.postApi(
            "api/appointment/book",
            buildJsonObject {
                put("eventTypeUri", eventTypeUri)
                put("startTime", startTime)
                if (typeName != null) put("typeName", typeName)
                if (timezone != null) put("timezone", timezone)
                if (!forUserId.isNullOrBlank()) put("forUserId", forUserId)
            },
        )
}
