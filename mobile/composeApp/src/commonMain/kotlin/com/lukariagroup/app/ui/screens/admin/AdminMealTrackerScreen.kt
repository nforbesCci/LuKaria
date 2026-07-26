package com.lukariagroup.app.ui.screens.admin

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.DayMeals
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun AdminMealTrackerScreen(userId: String, onBack: () -> Unit) {
    var days by remember { mutableStateOf<List<DayMeals>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(userId) {
        loading = true
        runCatching {
            val m = AppContainer.adminRepository.fetchMeals(userId, daysBack = 28)
            val p = AppContainer.adminRepository.fetchProfile(userId)
            m to p
        }.onSuccess { (m, p) ->
            days = m.meals
            patientName = p.profile?.name ?: userId
            error = null
        }.onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Meal Tracker", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)

        AdminGeneratePdfButton(
            title = "Meal Tracker",
            patientName = patientName,
            sections = {
                days.map { day ->
                    val allMeals = day.allItems
                    val calories = allMeals.sumOf { it.calories ?: 0.0 }
                    AdminPdfSection(
                        day.date,
                        "${allMeals.size} meals · ${calories.toInt()} kcal\n" +
                            allMeals.joinToString("\n") { "• ${it.name ?: "Meal"} (${it.calories?.toInt() ?: 0} kcal)" },
                    )
                }.ifEmpty { listOf(AdminPdfSection("Meals", "No meal days")) }
            },
        )

        SectionTitle("Days")
        if (days.isEmpty()) BodyCopy("No meal data in the last 28 days.")
        days.forEach { day ->
            val allMeals = day.allItems
            val calories = allMeals.sumOf { it.calories ?: 0.0 }
            BodyCopy("${day.date}: ${allMeals.size} meals · ${calories.toInt()} kcal")
            allMeals.take(8).forEach { meal ->
                BodyCopy("  • ${meal.name ?: "Meal"} (${meal.calories?.toInt() ?: 0} kcal)")
            }
        }
    }
}
