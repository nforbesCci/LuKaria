package com.lukariagroup.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

@Serializable
data class ApiMessage(
    val success: Boolean = true,
    val message: String? = null,
    val error: String? = null,
    val details: String? = null,
)

@Serializable
data class PublicCalendarInfo(
    val provider: String? = null,
    val bookingUrl: String? = null,
    val eventTypeUrl: String? = null,
    val bookingLabel: String? = null,
    val enabled: Boolean = true,
)

@Serializable
data class PublicCalendarResponse(
    val success: Boolean = true,
    val calendar: PublicCalendarInfo? = null,
    val error: String? = null,
)

@Serializable
data class CalendarAdminConfig(
    val provider: String? = null,
    val bookingUrl: String? = null,
    val eventTypeUrl: String? = null,
    val eventTypeUri: String? = null,
    val bookingLabel: String? = null,
    val enabled: Boolean = true,
    val apiToken: String? = null,
    val hasApiToken: Boolean = false,
    val webhookSigningKey: String? = null,
    val hasWebhookSigningKey: Boolean = false,
    val webhookUrl: String? = null,
)

@Serializable
data class CalendarAdminResponse(
    val success: Boolean = true,
    val config: CalendarAdminConfig? = null,
    val error: String? = null,
    val details: String? = null,
)

@Serializable
data class ProfileResponse(
    val success: Boolean = true,
    val message: String? = null,
    val profile: PatientProfile? = null,
    val schedule: AppointmentSchedule? = null,
    val exists: Boolean = false,
    val error: String? = null,
)

@Serializable
data class AppointmentSchedule(
    val userId: String? = null,
    val isScheduled: Boolean? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val date: String? = null,
    val time: String? = null,
    val type: String? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val length: Int? = null,
    val status: String? = null,
)

@Serializable
data class PatientProfile(
    val userId: String? = null,
    val name: String? = null,
    val userEmail: String? = null,
    val email: String? = null,
    val preferredEmail: String? = null,
    val phone: String? = null,
    val preferredPhone: String? = null,
    val dateOfBirth: String? = null,
    val sex: String? = null,
    val gender: String? = null,
    val parish: String? = null,
    val address: String? = null,
    val homeAddress: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zip: String? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val heightFeet: Int? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val heightInches: Int? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val startingWeight: Double? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val goalWeight: Double? = null,
    val emergencyContactName: String? = null,
    val emergencyContactPhone: String? = null,
    val emergencyContactRelationship: String? = null,
    val nextOfKinName: String? = null,
    val nextOfKinPhone: String? = null,
    val nextOfKinRelationship: String? = null,
    val pharmacyName: String? = null,
    val pharmacyPhone: String? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val allergies: String? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val allergicMedications: String? = null,
    val hasAllergies: Boolean? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val currentMedications: String? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val medicalHistory: String? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val medicalConditions: String? = null,
    @Serializable(with = FlexibleStringSerializer::class)
    val otherMedicalCondition: String? = null,
    val membershipTier: String? = null,
    val membershipStatus: String? = null,
    val isScheduled: Boolean? = null,
    @SerialName("user_metadata")
    val userMetadata: JsonObject? = null,
)

@Serializable
data class ConsentPayload(
    val patientName: String? = null,
    val patientDOB: String? = null,
    val consentDate: String? = null,
    val signature: String? = null,
    val complete: Boolean = false,
    val available: Boolean? = null,
    val locked: Boolean? = null,
    // Legacy aliases used by early mobile drafts
    val signatureDataUrl: String? = null,
    val signedAt: String? = null,
    val fullName: String? = null,
    val acknowledged: Boolean = false,
    val formVersion: String? = null,
    val extra: JsonObject? = null,
)

@Serializable
data class ConsentResponse(
    val success: Boolean = true,
    val data: ConsentPayload? = null,
    val consent: ConsentPayload? = null,
    val exists: Boolean = false,
    val message: String? = null,
    val error: String? = null,
) {
    val record: ConsentPayload? get() = data ?: consent
}

@Serializable
data class AppointmentInfo(
    val eventUri: String? = null,
    val inviteeUri: String? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val status: String? = null,
    val joinUrl: String? = null,
    val name: String? = null,
    val email: String? = null,
    val rescheduleUrl: String? = null,
    val cancelUrl: String? = null,
)

@Serializable
data class AppointmentResponse(
    val success: Boolean = true,
    val appointment: AppointmentInfo? = null,
    val configured: Boolean = false,
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class BookableType(
    val id: String? = null,
    val name: String? = null,
    val durationMinutes: Int? = null,
    val eventTypeUri: String? = null,
    val eventTypeUrl: String? = null,
)

@Serializable
data class BookableTypesResponse(
    val success: Boolean = true,
    val enabled: Boolean = true,
    val types: List<BookableType> = emptyList(),
    val bookingLabel: String? = null,
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class AvailabilitySlot(
    val startTime: String? = null,
    val status: String? = null,
    val inviteesRemaining: Int? = null,
)

@Serializable
data class AvailabilityResponse(
    val success: Boolean = true,
    val slots: List<AvailabilitySlot> = emptyList(),
    val error: String? = null,
)

@Serializable
data class BookAppointmentResponse(
    val success: Boolean = true,
    val message: String? = null,
    val appointment: AppointmentInfo? = null,
    val error: String? = null,
)

@Serializable
data class MeasurementEntry(
    val date: String? = null,
    val dateKey: String? = null,
    val weight: Double? = null,
    val waist: Double? = null,
    val waistCircumference: Double? = null,
    val hips: Double? = null,
    val chest: Double? = null,
    val notes: String? = null,
    val unit: String = "lbs",
) {
    val displayDate: String? get() = dateKey ?: date
    val displayWaist: Double? get() = waistCircumference ?: waist
}

@Serializable
data class MeasurementsResponse(
    val success: Boolean = true,
    val measurements: List<MeasurementEntry> = emptyList(),
    val measurement: MeasurementEntry? = null,
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class MedicationEntry(
    val date: String? = null,
    val medicationName: String? = null,
    val dose: String? = null,
    val dosage: String? = null,
    val taken: Boolean = false,
    val notes: String? = null,
    val time: String? = null,
)

@Serializable
data class FormularyMedication(
    val name: String,
    val doses: List<String> = emptyList(),
)

@Serializable
data class FormularyResponse(
    val success: Boolean = true,
    val medications: List<FormularyMedication> = emptyList(),
    val error: String? = null,
)

@Serializable
data class MedicationsResponse(
    val success: Boolean = true,
    val medications: List<MedicationEntry> = emptyList(),
    val medication: MedicationEntry? = null,
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class MealItem(
    val name: String? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val calories: Double? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val protein: Double? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val carbs: Double? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val fat: Double? = null,
    val servingSize: String? = null,
    val barcode: String? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val quantity: Int? = null,
    val mealType: String? = null,
    val photoUrl: String? = null,
    val portion: String? = null,
)

@Serializable
data class DayMeals(
    val date: String,
    val meals: Map<String, List<MealItem>> = emptyMap(),
    val notes: String? = null,
) {
    val allItems: List<MealItem>
        get() = meals.values.flatten().filter { item ->
            val name = item.name?.trim().orEmpty()
            name.isNotEmpty() && !name.equals("No data", ignoreCase = true)
        }
}

@Serializable
data class MealsResponse(
    val success: Boolean = true,
    @Serializable(with = MealsByDateSerializer::class)
    val meals: List<DayMeals> = emptyList(),
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class MealAnalyzeItem(
    val name: String? = null,
    @Serializable(with = FlexibleDoubleSerializer::class)
    val calories: Double? = null,
    val mealType: String? = null,
    val portion: String? = null,
    val servingSize: String? = null,
)

@Serializable
data class MealAnalyzeResponse(
    val success: Boolean = true,
    val mealType: String? = null,
    val items: List<MealAnalyzeItem> = emptyList(),
    @Serializable(with = FlexibleDoubleSerializer::class)
    val totalCalories: Double? = null,
    val error: String? = null,
)

@Serializable
data class MealSaveResponse(
    val success: Boolean = true,
    val message: String? = null,
    val date: String? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val mealsCount: Int? = null,
    val error: String? = null,
)

@Serializable
data class SideEffectEntry(
    val id: String? = null,
    @SerialName("_id")
    val mongoId: String? = null,
    val date: String? = null,
    val reportDate: String? = null,
    val reportId: String? = null,
    val symptoms: List<String> = emptyList(),
    val sideEffects: List<String> = emptyList(),
    val otherSideEffect: String? = null,
    val sideEffectSeverities: Map<String, Int>? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val otherSeverity: Int? = null,
    @Serializable(with = FlexibleIntSerializer::class)
    val severity: Int? = null,
    val notes: String? = null,
    val contactMessage: String? = null,
    val nausea: Boolean = false,
    val vomiting: Boolean = false,
    val constipation: Boolean = false,
    val diarrhea: Boolean = false,
    val fatigue: Boolean = false,
    val headache: Boolean = false,
    val reviewed: Boolean = false,
    val reviewNotes: String? = null,
    val complete: Boolean = false,
) {
    val entryId: String? get() = id ?: mongoId
}

@Serializable
data class SideEffectsResponse(
    val success: Boolean = true,
    val sideEffects: List<SideEffectEntry> = emptyList(),
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class AppNotification(
    val id: String? = null,
    @SerialName("_id")
    val mongoId: String? = null,
    val userId: String? = null,
    val title: String? = null,
    val message: String? = null,
    val type: String? = null,
    val read: Boolean = false,
    val timestamp: String? = null,
)

@Serializable
data class NotificationsResponse(
    val success: Boolean = true,
    val notifications: List<AppNotification> = emptyList(),
    val error: String? = null,
)

@Serializable
data class BlogPost(
    @SerialName("_id")
    val id: String? = null,
    val title: String? = null,
    val slug: String? = null,
    val content: String? = null,
    val imageUrl: String? = null,
    val postKind: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val authorName: String? = null,
    val videos: List<JsonElement> = emptyList(),
)

@Serializable
data class BlogComment(
    @SerialName("_id")
    val id: String? = null,
    val authorName: String? = null,
    val body: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class VideoItem(
    val id: String? = null,
    val name: String? = null,
    val webUrl: String? = null,
    val downloadUrl: String? = null,
    val thumbnailUrl: String? = null,
    val size: Long? = null,
)

@Serializable
data class VideosResponse(
    val success: Boolean = true,
    val videos: List<VideoItem> = emptyList(),
    val error: String? = null,
)

@Serializable
data class FoodProduct(
    val code: String? = null,
    val productName: String? = null,
    val brands: String? = null,
    val calories: Double? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null,
    val imageUrl: String? = null,
)

@Serializable
data class FoodSearchResponse(
    val success: Boolean = true,
    val products: List<FoodProduct> = emptyList(),
    val product: FoodProduct? = null,
    val error: String? = null,
)

@Serializable
data class AdminUserSummary(
    @SerialName("user_id")
    val userId: String? = null,
    val email: String? = null,
    val name: String? = null,
    val nickname: String? = null,
    val blocked: Boolean = false,
    @SerialName("last_login")
    val lastLogin: String? = null,
    val picture: String? = null,
)

@Serializable
data class AdminUsersResponse(
    val success: Boolean = true,
    val users: List<AdminUserSummary> = emptyList(),
    val total: Int = 0,
    val start: Int = 0,
    val limit: Int = 0,
    val length: Int = 0,
    val error: String? = null,
    val details: String? = null,
)

@Serializable
data class RescheduleRequest(
    val id: String? = null,
    @SerialName("_id")
    val mongoId: String? = null,
    val userId: String? = null,
    val userEmail: String? = null,
    val userName: String? = null,
    val reason: String? = null,
    val preferredTimes: String? = null,
    val status: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class RescheduleRequestsResponse(
    val success: Boolean = true,
    val requests: List<RescheduleRequest> = emptyList(),
    val error: String? = null,
)

@Serializable
data class PreAppointmentTask(
    val taskKey: String? = null,
    val completed: Boolean = false,
    val notes: String? = null,
    val label: String? = null,
)

@Serializable
data class PreAppointmentTasksResponse(
    val success: Boolean = true,
    val tasks: List<PreAppointmentTask> = emptyList(),
    val error: String? = null,
)

@Serializable
data class AdminQuestion(
    @SerialName("_id")
    val id: String? = null,
    val userId: String? = null,
    val question: String? = null,
    val text: String? = null,
    val category: String? = null,
    val answer: String? = null,
    val answered: Boolean = false,
    val createdAt: String? = null,
) {
    val displayText: String get() = question ?: text ?: ""
    val isAnswered: Boolean get() = answered || !answer.isNullOrBlank()
}

@Serializable
data class AdminQuestionsResponse(
    val success: Boolean = true,
    val questions: List<AdminQuestion> = emptyList(),
    val error: String? = null,
)

@Serializable
data class DbProfileResponse(
    val success: Boolean = true,
    val profile: PatientProfile? = null,
    val message: String? = null,
    val error: String? = null,
)

@Serializable
data class Auth0RoleSummary(
    val id: String? = null,
    val name: String? = null,
    val description: String? = null,
)

@Serializable
data class UserRolesResponse(
    val success: Boolean = true,
    val userId: String? = null,
    val roles: List<Auth0RoleSummary> = emptyList(),
    val primaryRole: String? = null,
    val availableRoles: List<Auth0RoleSummary> = emptyList(),
    val message: String? = null,
    val error: String? = null,
    val details: String? = null,
)

@Serializable
data class BodyScanCreateRequest(
    val height: Int,
    val weight: Int? = null,
    val gender: String,
    val age: Int? = null,
    val frontPhoto: String,
    val sidePhoto: String,
)

@Serializable
data class BodyScanErrorItem(
    val error_source: String? = null,
    val detail: String? = null,
    val description: String? = null,
)

@Serializable
data class BodyScanMeasurement(
    val id: String? = null,
    val status: String? = null,
    val gender: String? = null,
    val height: Int? = null,
    val weight: Double? = null,
    val estimated_weight: Double? = null,
    val age: Int? = null,
    val fat_percentage: Double? = null,
    val bmi: Double? = null,
    val estimated_bmi: Double? = null,
    val bmr: Double? = null,
    val estimated_bmr: Double? = null,
    val fat_body_mass: Double? = null,
    val estimated_fat_body_mass: Double? = null,
    val lean_body_mass: Double? = null,
    val estimated_lean_body_mass: Double? = null,
    val model_3d_url: String? = null,
    val circumference_params: JsonObject? = null,
    val created_at: String? = null,
    val completed_at: String? = null,
    val errors: List<BodyScanErrorItem> = emptyList(),
)

@Serializable
data class BodyScanMutationResponse(
    val success: Boolean = true,
    val measurementId: String? = null,
    val status: String? = null,
    val measurement: BodyScanMeasurement? = null,
    val error: String? = null,
)

@Serializable
data class BodyScanListItem(
    val measurementId: String? = null,
    val status: String? = null,
    val gender: String? = null,
    val heightCm: Int? = null,
    val weightKg: Int? = null,
    val age: Int? = null,
    val createdAt: String? = null,
    val measurement: BodyScanMeasurement? = null,
)

@Serializable
data class BodyScanListResponse(
    val success: Boolean = true,
    val count: Int = 0,
    val scans: List<BodyScanListItem> = emptyList(),
    val error: String? = null,
)

enum class ConsentType(val pathSegment: String, val displayName: String) {
    TELEHEALTH("telehealth", "Telehealth Consent"),
    PHOTOGRAPH("photograph", "Photograph Consent"),
    SEMAGLUTIDE("semaglutide", "Semaglutide Consent"),
    MOUNJARO("mounjaro", "Mounjaro / Tirzepatide Consent"),
    RETATRUTIDE("retatrutide", "Retatrutide Consent"),
}
