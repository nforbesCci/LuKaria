package com.lukariagroup.app.data.models

/**
 * Resolve lean/fat mass: primary → estimated → weight × fat %.
 */
data class ResolvedBodyMass(
    val leanKg: Double?,
    val fatKg: Double?,
)

fun BodyScanMeasurement?.resolveBodyMass(fallbackWeightKg: Number? = null): ResolvedBodyMass {
    val m = this ?: return ResolvedBodyMass(null, null)
    var lean = m.lean_body_mass ?: m.estimated_lean_body_mass
    var fat = m.fat_body_mass ?: m.estimated_fat_body_mass
    if (lean == null || fat == null) {
        val weight = (m.weight ?: m.estimated_weight ?: fallbackWeightKg)?.toDouble()
        val fatPct = m.fat_percentage
        if (weight != null && fatPct != null) {
            val derivedFat = weight * fatPct / 100.0
            val derivedLean = weight - derivedFat
            if (fat == null) fat = derivedFat
            if (lean == null) lean = derivedLean
        }
    }
    return ResolvedBodyMass(leanKg = lean, fatKg = fat)
}
