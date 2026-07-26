package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.MedicationEntry
import com.lukariagroup.app.data.models.MedicationsResponse
import io.ktor.client.HttpClient

class MedicationRepository(private val client: HttpClient) {
    suspend fun fetchLatest(): MedicationsResponse =
        client.getApi("api/medications/fetch")

    suspend fun fetchAll(): MedicationsResponse =
        client.getApi("api/medications/fetchAll")

    suspend fun save(entry: MedicationEntry): MedicationsResponse =
        client.postApi("api/medications/save", entry)
}
