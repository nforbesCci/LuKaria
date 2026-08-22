package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.FormularyResponse
import com.lukariagroup.app.data.models.MedicationEntry
import com.lukariagroup.app.data.models.MedicationsResponse
import io.ktor.client.HttpClient
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class MedicationRepository(private val client: HttpClient) {
    suspend fun fetchLatest(): MedicationsResponse =
        client.getApi("api/medications/fetch")

    suspend fun fetchAll(): MedicationsResponse =
        client.getApi("api/medications/fetchAll")

    suspend fun allowed(): FormularyResponse =
        client.getApi("api/medications/allowed")

    suspend fun save(entry: MedicationEntry): MedicationsResponse {
        val dosage = entry.dosage ?: entry.dose
        return client.postApi(
            "api/medications/save",
            buildJsonObject {
                put("date", entry.date)
                put("medicationName", entry.medicationName)
                put("dosage", dosage)
                put("dose", dosage)
                put("taken", entry.taken)
                put("notes", entry.notes)
                put("time", entry.time)
            },
        )
    }
}
