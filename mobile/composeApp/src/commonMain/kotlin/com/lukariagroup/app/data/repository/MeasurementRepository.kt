package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.MeasurementEntry
import com.lukariagroup.app.data.models.MeasurementsResponse
import io.ktor.client.HttpClient

class MeasurementRepository(private val client: HttpClient) {
    suspend fun fetchLatest(): MeasurementsResponse =
        client.getApi("api/measurements/fetch")

    suspend fun fetchAll(): MeasurementsResponse =
        client.getApi("api/measurements/fetchAll")

    suspend fun save(entry: MeasurementEntry): MeasurementsResponse =
        client.postApi("api/measurements/save", entry)
}
