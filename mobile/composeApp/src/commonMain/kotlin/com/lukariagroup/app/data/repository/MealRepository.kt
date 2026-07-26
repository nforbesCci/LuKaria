package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.DayMeals
import com.lukariagroup.app.data.models.MealsResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter

class MealRepository(private val client: HttpClient) {
    suspend fun fetch(daysBack: Int = 14): MealsResponse =
        client.getApi("api/meals/fetch") {
            parameter("daysBack", daysBack)
        }

    suspend fun save(dayMeals: DayMeals): MealsResponse =
        client.postApi("api/meals/save", dayMeals)
}
