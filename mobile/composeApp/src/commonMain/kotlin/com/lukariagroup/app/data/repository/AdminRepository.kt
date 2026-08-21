package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.AdminQuestionsResponse
import com.lukariagroup.app.data.models.AdminUsersResponse
import com.lukariagroup.app.data.models.ApiMessage
import com.lukariagroup.app.data.models.BodyScanListResponse
import com.lukariagroup.app.data.models.CalendarAdminResponse
import com.lukariagroup.app.data.models.DbProfileResponse
import com.lukariagroup.app.data.models.MealsResponse
import com.lukariagroup.app.data.models.MeasurementsResponse
import com.lukariagroup.app.data.models.MedicationsResponse
import com.lukariagroup.app.data.models.PreAppointmentTasksResponse
import com.lukariagroup.app.data.models.ProfileResponse
import com.lukariagroup.app.data.models.RescheduleRequestsResponse
import com.lukariagroup.app.data.models.SideEffectsResponse
import com.lukariagroup.app.data.models.UserRolesResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class AdminRepository(private val client: HttpClient) {
    suspend fun listUsers(
        page: Int = 0,
        perPage: Int = 5,
        search: String = "",
    ): AdminUsersResponse =
        client.getApi("api/admin/users") {
            parameter("page", page)
            parameter("per_page", perPage)
            if (search.isNotBlank()) parameter("search", search)
        }

    suspend fun fetchProfile(userId: String): ProfileResponse =
        client.getApi("api/admin/profile/$userId")

    suspend fun fetchDbProfile(userId: String): DbProfileResponse =
        client.getApi("api/admin/users/$userId/profile")

    suspend fun updateAdminProfile(userId: String, body: JsonObject): ApiMessage =
        client.postApi("api/admin/users/$userId/profile", body)

    suspend fun fetchMeasurements(userId: String, daysBack: Int = 28): MeasurementsResponse =
        client.getApi("api/admin/measurements/$userId") {
            parameter("daysBack", daysBack)
        }

    suspend fun fetchBodyScans(userId: String): BodyScanListResponse =
        client.getApi("api/admin/body-scans/$userId")

    suspend fun fetchMedications(userId: String, daysBack: Int = 28): MedicationsResponse =
        client.getApi("api/admin/medications/$userId") {
            parameter("daysBack", daysBack)
        }

    suspend fun fetchMeals(userId: String, daysBack: Int = 28): MealsResponse =
        client.getApi("api/admin/meals/$userId") {
            parameter("daysBack", daysBack)
        }

    suspend fun fetchSideEffects(userId: String, limit: Int = 4): SideEffectsResponse =
        client.getApi("api/admin/side-effects/$userId") {
            parameter("limit", limit)
        }

    suspend fun listAllSideEffects(): SideEffectsResponse =
        client.getApi("api/admin/side-effects")

    suspend fun reviewSideEffect(
        userId: String,
        entryId: String? = null,
        reviewNotes: String,
        reviewed: Boolean = true,
    ): SideEffectsResponse =
        client.postApi(
            "api/admin/side-effects/review",
            buildJsonObject {
                put("userId", userId)
                put("reviewNotes", reviewNotes)
                put("reviewed", reviewed)
                if (entryId != null) put("entryId", entryId)
            },
        )

    suspend fun listRescheduleRequests(): RescheduleRequestsResponse =
        client.getApi("api/admin/reschedule-requests")

    suspend fun adminReschedule(body: JsonObject): JsonObject =
        client.postApi("api/admin/appointment/reschedule", body)

    suspend fun fetchConsentForms(userId: String): JsonObject =
        client.getApi("api/admin/consent-forms/$userId")

    suspend fun fetchPreAppointmentTasks(userId: String): PreAppointmentTasksResponse =
        client.getApi("api/admin/pre-appointment-tasks/$userId")

    suspend fun fetchQuestions(userId: String, limit: Int = 10): AdminQuestionsResponse =
        client.getApi("api/admin/questions/$userId") {
            parameter("limit", limit)
        }

    suspend fun deleteQuestion(userId: String, questionId: String): ApiMessage =
        client.deleteApi(
            "api/admin/questions/$userId",
            buildJsonObject { put("questionId", questionId) },
        )

    suspend fun enableUser(userId: String, consultationOccurred: Boolean): JsonObject =
        client.postApi(
            "api/admin/users/$userId/enable",
            buildJsonObject { put("consultationOccurred", consultationOccurred) },
        )

    suspend fun fetchUserRoles(userId: String): UserRolesResponse =
        client.getApi("api/admin/users/$userId/roles")

    suspend fun setUserRole(userId: String, role: String): UserRolesResponse =
        client.putApi(
            "api/admin/users/$userId/roles",
            buildJsonObject { put("role", role) },
        )

    suspend fun sendLabPdf(body: JsonObject): JsonObject =
        client.postApi("api/pdf/lab-requisition", body)

    suspend fun fetchAdminSettings(): JsonObject =
        client.getApi("api/admin/settings")

    suspend fun saveAdminSettingsConfig(type: String, config: JsonObject): ApiMessage =
        client.postApi(
            "api/admin/settings/config",
            buildJsonObject {
                put("type", type)
                put("config", config)
            },
        )

    suspend fun fetchCalendarSettings(): CalendarAdminResponse =
        client.getApi("api/admin/settings/calendar")

    suspend fun saveCalendarSettings(body: JsonObject): CalendarAdminResponse =
        client.putApi("api/admin/settings/calendar", body)

    suspend fun sendMicrosoftTestEmail(to: String): ApiMessage =
        client.postApi("api/admin/microsoft/test", buildJsonObject { put("to", to) })

    suspend fun sendGoogleTestEmail(to: String): ApiMessage =
        client.postApi("api/admin/google/test", buildJsonObject { put("to", to) })

    suspend fun updateConsentForm(
        userId: String,
        formType: String,
        enabled: Boolean? = null,
        locked: Boolean? = null,
        complete: Boolean? = null,
    ): JsonObject =
        client.putApi(
            "api/admin/consent-forms/$userId",
            buildJsonObject {
                put("formType", formType)
                if (enabled != null) put("enabled", enabled)
                if (locked != null) put("locked", locked)
                if (complete != null) put("complete", complete)
            },
        )
}
