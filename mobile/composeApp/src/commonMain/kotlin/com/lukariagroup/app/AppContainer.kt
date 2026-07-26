package com.lukariagroup.app

import com.lukariagroup.app.auth.AuthRepository
import com.lukariagroup.app.auth.AuthViewModel
import com.lukariagroup.app.auth.TokenStore
import com.lukariagroup.app.core.ApiClient
import com.lukariagroup.app.data.repository.AdminRepository
import com.lukariagroup.app.data.repository.AppointmentRepository
import com.lukariagroup.app.data.repository.BlogRepository
import com.lukariagroup.app.data.repository.ConsentRepository
import com.lukariagroup.app.data.repository.FoodRepository
import com.lukariagroup.app.data.repository.MealRepository
import com.lukariagroup.app.data.repository.MeasurementRepository
import com.lukariagroup.app.data.repository.MedicationRepository
import com.lukariagroup.app.data.repository.NotificationRepository
import com.lukariagroup.app.data.repository.ProfileRepository
import com.lukariagroup.app.data.repository.SideEffectRepository
import com.lukariagroup.app.data.repository.VideoRepository
import io.ktor.client.HttpClient

/**
 * Simple service locator for M0–M5. Replace with DI (Koin/Kodein) later if desired.
 */
object AppContainer {
    val tokenStore: TokenStore by lazy { TokenStore() }
    val httpClient: HttpClient by lazy { ApiClient.create(tokenStore) }
    val authRepository: AuthRepository by lazy { AuthRepository(tokenStore) }

    val profileRepository by lazy { ProfileRepository(httpClient) }
    val consentRepository by lazy { ConsentRepository(httpClient) }
    val appointmentRepository by lazy { AppointmentRepository(httpClient) }
    val measurementRepository by lazy { MeasurementRepository(httpClient) }
    val medicationRepository by lazy { MedicationRepository(httpClient) }
    val mealRepository by lazy { MealRepository(httpClient) }
    val sideEffectRepository by lazy { SideEffectRepository(httpClient) }
    val notificationRepository by lazy { NotificationRepository(httpClient) }
    val blogRepository by lazy { BlogRepository(httpClient) }
    val videoRepository by lazy { VideoRepository(httpClient) }
    val foodRepository by lazy { FoodRepository(httpClient) }
    val adminRepository by lazy { AdminRepository(httpClient) }

    fun authViewModel(): AuthViewModel = AuthViewModel(authRepository)
}
