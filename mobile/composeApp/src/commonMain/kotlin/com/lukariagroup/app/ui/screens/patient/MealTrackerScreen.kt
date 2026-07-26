package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.DayMeals
import com.lukariagroup.app.data.models.MealItem
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun MealTrackerScreen(onBack: () -> Unit, onOpenBarcode: () -> Unit) {
    var days by remember { mutableStateOf<List<DayMeals>>(emptyList()) }
    var date by remember { mutableStateOf("") }
    var mealType by remember { mutableStateOf("lunch") }
    var foodName by remember { mutableStateOf("") }
    var calories by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { AppContainer.mealRepository.fetch(14) }
                .onSuccess { days = it.meals; error = null }
                .onFailure { error = it.message }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LukariaScaffold(title = "Meal tracker", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        SectionTitle("Add meal item")
        OutlinedTextField(date, { date = it }, label = { Text("Date") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(mealType, { mealType = it }, label = { Text("Meal (breakfast/lunch/dinner/snack)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(foodName, { foodName = it }, label = { Text("Food") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(calories, { calories = it }, label = { Text("Calories") }, modifier = Modifier.fillMaxWidth())
        Button(
            onClick = {
                scope.launch {
                    val item = MealItem(name = foodName, calories = calories.toDoubleOrNull())
                    val existing = days.find { it.date == date }
                    val mealsMap = (existing?.meals ?: emptyMap()).toMutableMap()
                    mealsMap[mealType] = (mealsMap[mealType] ?: emptyList()) + item
                    runCatching {
                        AppContainer.mealRepository.save(DayMeals(date = date, meals = mealsMap))
                    }.onSuccess { refresh() }.onFailure { error = it.message }
                }
            },
            enabled = date.isNotBlank() && foodName.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save meal") }

        Button(onClick = onOpenBarcode, modifier = Modifier.fillMaxWidth()) {
            Text("Scan barcode")
        }

        SectionTitle("Recent days")
        days.take(10).forEach { day ->
            Text(day.date, style = androidx.compose.material3.MaterialTheme.typography.titleSmall)
            day.meals.forEach { (type, items) ->
                Text("  $type: ${items.joinToString { it.name ?: "?" }}")
            }
        }
    }
}
