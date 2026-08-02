package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.PublicCalendarResponse
import io.ktor.client.HttpClient

class CalendarRepository(private val client: HttpClient) {
    suspend fun fetchPublic(): PublicCalendarResponse =
        client.getApi("api/calendar")
}
