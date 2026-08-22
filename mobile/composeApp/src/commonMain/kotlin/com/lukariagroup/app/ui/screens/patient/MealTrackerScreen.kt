package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.DayMeals
import com.lukariagroup.app.data.models.MealItem
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.IsoDatePickerField
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

private data class MealSlot(val key: String, val label: String)

private val MEAL_SLOTS = listOf(
    MealSlot("breakfast", "Breakfast"),
    MealSlot("morning_snack", "Morning snack"),
    MealSlot("lunch", "Lunch"),
    MealSlot("afternoon_snack", "Afternoon snack"),
    MealSlot("dinner", "Dinner"),
    MealSlot("supper", "Supper"),
)

@Composable
fun MealTrackerScreen(onBack: () -> Unit) {
    var days by remember { mutableStateOf<List<DayMeals>>(emptyList()) }
    var date by remember { mutableStateOf(todayIsoDate()) }
    var pendingSlot by remember { mutableStateOf<String?>(null) }
    var slotPhotos by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var retakingSlots by remember { mutableStateOf<Set<String>>(emptySet()) }
    var analyzing by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refreshDays() {
        scope.launch {
            loading = true
            runCatching { AppContainer.mealRepository.fetch(14) }
                .onSuccess {
                    days = it.meals
                    error = null
                }
                .onFailure { error = it.message }
            loading = false
        }
    }

    fun onPhotoChosen(dataUrl: String) {
        val slot = pendingSlot ?: return
        pendingSlot = null
        slotPhotos = slotPhotos + (slot to dataUrl)
        retakingSlots = retakingSlots - slot
        scope.launch {
            analyzing = true
            message = null
            error = null
            runCatching {
                val analysis = AppContainer.mealRepository.analyzePhoto(dataUrl, slot, date)
                val items = analysis.items.map {
                    MealItem(
                        name = it.name,
                        calories = it.calories,
                        mealType = slot,
                        portion = it.portion,
                        servingSize = it.servingSize,
                        photoUrl = "attached",
                    )
                }.ifEmpty {
                    listOf(
                        MealItem(
                            name = "Meal (photo)",
                            calories = analysis.totalCalories,
                            mealType = slot,
                            photoUrl = "attached",
                        ),
                    )
                }
                val existing = days.find { it.date == date }
                val mealsMap = (existing?.meals ?: emptyMap()).toMutableMap()
                mealsMap[slot] = items
                AppContainer.mealRepository.save(DayMeals(date = date, meals = mealsMap))
                analysis to slot
            }.onSuccess { (analysis, slotKey) ->
                message =
                    "Saved ${slotKey.replace('_', ' ')} · ~${analysis.totalCalories?.toInt() ?: "?"} kcal"
                refreshDays()
            }.onFailure { error = it.message }
            analyzing = false
        }
    }

    val imageSources = rememberImageDataUrlSources { dataUrl ->
        if (dataUrl.isNullOrBlank()) {
            pendingSlot = null
            return@rememberImageDataUrlSources
        }
        onPhotoChosen(dataUrl)
    }

    LaunchedEffect(Unit) { refreshDays() }

    val todayMeals = days.find { it.date == date }?.meals.orEmpty()

    LukariaScaffold(title = "Meal tracker", onBack = onBack) {
        if (loading && days.isEmpty()) LoadingBlock()
        ErrorText(error)
        message?.let { Text(it) }

        SectionTitle("Day")
        IsoDatePickerField(dateIso = date, onDateChange = { date = it })
        BodyCopy("Up to 6 meals per day. One photo per meal — calories from Gemini + FatSecret.")

        if (analyzing) {
            LoadingBlock()
            Text("Analyzing photo…")
        }

        MEAL_SLOTS.forEach { slot ->
            val items = todayMeals[slot.key].orEmpty()
            val photo = slotPhotos[slot.key]
            val filled = items.isNotEmpty() || photo != null
            val showChooser = !filled || slot.key in retakingSlots
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (filled && slot.key !in retakingSlots) {
                        MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                    } else {
                        MaterialTheme.colorScheme.surfaceVariant
                    },
                ),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(slot.label, style = MaterialTheme.typography.titleMedium)
                    if (!showChooser) {
                        if (photo != null) {
                            MealPhotoPreview(photo, Modifier.fillMaxWidth())
                        }
                        if (items.isNotEmpty()) {
                            val kcal = items.sumOf { it.calories ?: 0.0 }
                            Text(items.joinToString { it.name ?: "?" })
                            Text("~${kcal.toInt()} kcal")
                        } else if (analyzing) {
                            Text("Analyzing…")
                        }
                        OutlinedButton(
                            onClick = {
                                retakingSlots = retakingSlots + slot.key
                            },
                            enabled = !analyzing,
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text("Retake") }
                    } else {
                        Button(
                            onClick = {
                                pendingSlot = slot.key
                                imageSources.takePhoto()
                            },
                            enabled = !analyzing,
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text("Take photo") }
                        OutlinedButton(
                            onClick = {
                                pendingSlot = slot.key
                                imageSources.pickGallery()
                            },
                            enabled = !analyzing,
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text("Choose from gallery") }
                        if (filled) {
                            OutlinedButton(
                                onClick = {
                                    retakingSlots = retakingSlots - slot.key
                                },
                                enabled = !analyzing,
                                modifier = Modifier.fillMaxWidth(),
                            ) { Text("Cancel") }
                        }
                    }
                }
            }
        }

        SectionTitle("Recent days")
        days.take(7).forEach { day ->
            Text(day.date, style = MaterialTheme.typography.titleSmall)
            day.meals.forEach { (type, items) ->
                Text("  $type: ${items.joinToString { it.name ?: "?" }}")
            }
        }
    }
}
