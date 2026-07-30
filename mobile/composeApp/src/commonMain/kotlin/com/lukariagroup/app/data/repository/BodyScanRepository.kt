package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.BodyScanCreateRequest
import com.lukariagroup.app.data.models.BodyScanListResponse
import com.lukariagroup.app.data.models.BodyScanMutationResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter

class BodyScanRepository(private val client: HttpClient) {
    suspend fun create(request: BodyScanCreateRequest): BodyScanMutationResponse =
        client.postApi("api/body-scan/create", request)

    suspend fun status(measurementId: String): BodyScanMutationResponse =
        client.getApi("api/body-scan/status") {
            parameter("id", measurementId)
        }

    suspend fun list(): BodyScanListResponse =
        client.getApi("api/body-scan/list")
}
