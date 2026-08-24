package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.BookingReminderResponse
import com.lukariagroup.app.data.models.NotificationsResponse
import io.ktor.client.HttpClient
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class NotificationRepository(private val client: HttpClient) {
    suspend fun fetch(): NotificationsResponse =
        client.getApi("api/notifications/fetch")

    suspend fun send(
        title: String,
        message: String,
        userId: String? = null,
        type: String = "info",
    ): NotificationsResponse =
        client.postApi(
            "api/notifications/send",
            buildJsonObject {
                put("title", title)
                put("message", message)
                put("type", type)
                if (userId != null) put("userId", userId)
            },
        )

    suspend fun myBookingReminder(): BookingReminderResponse =
        client.getApi("api/booking-reminder/mine")
}
