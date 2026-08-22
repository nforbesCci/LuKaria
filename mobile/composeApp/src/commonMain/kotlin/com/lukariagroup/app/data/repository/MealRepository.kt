package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.DayMeals
import com.lukariagroup.app.data.models.MealAnalyzeResponse
import com.lukariagroup.app.data.models.MealSaveResponse
import com.lukariagroup.app.data.models.MealsResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class MealRepository(private val client: HttpClient) {
    suspend fun fetch(daysBack: Int = 14): MealsResponse =
        client.getApi("api/meals/fetch") {
            parameter("daysBack", daysBack)
        }

    suspend fun save(dayMeals: DayMeals): MealSaveResponse =
        client.postApi("api/meals/save", dayMeals)

    suspend fun analyzePhoto(
        imageDataUrl: String,
        mealType: String,
        date: String,
    ): MealAnalyzeResponse =
        client.postApi(
            "api/meals/analyze-photo",
            buildJsonObject {
                put("image", imageDataUrl)
                put("mealType", mealType)
                put("date", date)
            },
        )
}
