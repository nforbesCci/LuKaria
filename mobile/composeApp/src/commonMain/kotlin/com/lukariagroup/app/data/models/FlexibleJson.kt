package com.lukariagroup.app.data.models

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonEncoder
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.put

/** Accepts JSON string, number, boolean, or string array → display String. */
object FlexibleStringSerializer : KSerializer<String?> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("FlexibleString", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): String? {
        val json = decoder as? JsonDecoder ?: return decoder.decodeString()
        return when (val el = json.decodeJsonElement()) {
            is JsonNull -> null
            is JsonPrimitive -> el.contentOrNull
            is JsonArray -> el.mapNotNull {
                when (it) {
                    is JsonPrimitive -> it.contentOrNull
                    else -> it.toString()
                }
            }.joinToString(", ").ifBlank { null }
            else -> el.toString()
        }
    }

    override fun serialize(encoder: Encoder, value: String?) {
        val json = encoder as? JsonEncoder
        if (json != null) {
            json.encodeJsonElement(JsonPrimitive(value))
        } else if (value != null) {
            encoder.encodeString(value)
        }
    }
}

/** Accepts JSON int, double, or numeric string → Int?. */
object FlexibleIntSerializer : KSerializer<Int?> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("FlexibleInt", PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder): Int? {
        val json = decoder as? JsonDecoder ?: return decoder.decodeInt()
        return when (val el = json.decodeJsonElement()) {
            is JsonNull -> null
            is JsonPrimitive -> el.contentOrNull?.toDoubleOrNull()?.toInt()
            else -> null
        }
    }

    override fun serialize(encoder: Encoder, value: Int?) {
        if (value == null) return
        encoder.encodeInt(value)
    }
}

/** Accepts JSON number or numeric string → Double?. */
object FlexibleDoubleSerializer : KSerializer<Double?> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("FlexibleDouble", PrimitiveKind.DOUBLE)

    override fun deserialize(decoder: Decoder): Double? {
        val json = decoder as? JsonDecoder ?: return decoder.decodeDouble()
        return when (val el = json.decodeJsonElement()) {
            is JsonNull -> null
            is JsonPrimitive -> el.contentOrNull?.toDoubleOrNull()
            else -> null
        }
    }

    override fun serialize(encoder: Encoder, value: Double?) {
        if (value == null) return
        encoder.encodeDouble(value)
    }
}

/**
 * API returns meals as `{ "YYYY-MM-DD": { breakfast: {...}|[...], ... } }`
 * (or occasionally a list of DayMeals). Normalize to List<DayMeals>.
 */
object MealsByDateSerializer : KSerializer<List<DayMeals>> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("MealsByDate", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): List<DayMeals> {
        val json = decoder as? JsonDecoder ?: error("MealsByDateSerializer requires JSON")
        return when (val el = json.decodeJsonElement()) {
            is JsonNull -> emptyList()
            is JsonArray -> el.mapNotNull { item ->
                runCatching { json.json.decodeFromJsonElement(DayMeals.serializer(), item) }.getOrNull()
            }
            is JsonObject -> el.map { (date, dayEl) ->
                DayMeals(date = date, meals = parseDayMealSlots(json.json, dayEl))
            }.sortedByDescending { it.date }
            else -> emptyList()
        }
    }

    override fun serialize(encoder: Encoder, value: List<DayMeals>) {
        val json = encoder as? JsonEncoder ?: error("MealsByDateSerializer requires JSON")
        val obj = buildJsonObject {
            value.forEach { day ->
                put(
                    day.date,
                    buildJsonObject {
                        day.meals.forEach { (slot, items) ->
                            put(
                                slot,
                                json.json.encodeToJsonElement(
                                    kotlinx.serialization.builtins.ListSerializer(MealItem.serializer()),
                                    items,
                                ),
                            )
                        }
                    },
                )
            }
        }
        json.encodeJsonElement(obj)
    }

    private fun parseDayMealSlots(
        json: kotlinx.serialization.json.Json,
        dayEl: kotlinx.serialization.json.JsonElement,
    ): Map<String, List<MealItem>> {
        return when (dayEl) {
            is JsonObject -> dayEl.mapValues { (_, slotEl) -> parseMealSlot(json, slotEl) }
            is JsonArray -> {
                val items = dayEl.mapNotNull {
                    runCatching { json.decodeFromJsonElement(MealItem.serializer(), it) }.getOrNull()
                }
                items.groupBy { it.mealType ?: "meal" }
            }
            else -> emptyMap()
        }
    }

    private fun parseMealSlot(
        json: kotlinx.serialization.json.Json,
        slotEl: kotlinx.serialization.json.JsonElement,
    ): List<MealItem> {
        return when (slotEl) {
            is JsonArray -> slotEl.mapNotNull {
                runCatching { json.decodeFromJsonElement(MealItem.serializer(), it) }.getOrNull()
            }
            is JsonObject -> listOfNotNull(
                runCatching { json.decodeFromJsonElement(MealItem.serializer(), slotEl) }.getOrNull(),
            )
            else -> emptyList()
        }
    }
}
