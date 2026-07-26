package com.lukariagroup.app.data.repository

import com.lukariagroup.app.data.models.FoodProduct
import com.lukariagroup.app.data.models.FoodSearchResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.parameter

class FoodRepository(private val client: HttpClient) {
    suspend fun search(query: String): FoodSearchResponse =
        client.getApi("api/food/search") {
            parameter("q", query)
        }

    suspend fun details(barcode: String): FoodSearchResponse =
        client.getApi("api/food/details") {
            parameter("barcode", barcode)
        }

    suspend fun lookupProduct(barcode: String): FoodSearchResponse =
        client.getApi("api/lookup-product") {
            parameter("barcode", barcode)
        }

    suspend fun findByBarcode(barcode: String): FoodProduct? {
        val fromFood = runCatching { details(barcode) }.getOrNull()
        if (fromFood?.product != null) return fromFood.product
        if (fromFood?.products?.isNotEmpty() == true) return fromFood.products.first()
        val lookup = runCatching { lookupProduct(barcode) }.getOrNull()
        return lookup?.product ?: lookup?.products?.firstOrNull()
    }
}
