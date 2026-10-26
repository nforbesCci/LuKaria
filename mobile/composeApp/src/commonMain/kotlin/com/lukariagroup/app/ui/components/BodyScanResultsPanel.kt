package com.lukariagroup.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lukariagroup.app.core.openExternalUrl
import com.lukariagroup.app.data.models.BodyScanListItem
import com.lukariagroup.app.data.models.BodyScanMeasurement
import com.lukariagroup.app.data.models.resolveBodyMass
import kotlin.math.round
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull

private val HeadingBlue = Color(0xFF1A3A6B)
private val LabelGray = Color(0xFF8A8F98)
private val CardBg = Color.White
private val PageBg = Color(0xFFF5F6F8)

private val CoreCircKeys = setOf("chest", "waist", "low_hips", "high_hips", "bust", "upper_chest_girth")

private enum class BodyScanUnits { Metric, Imperial }

/**
 * FitXpress-style results: person info, status, estimated data, fat %,
 * core measurements (+ More), and 3D avatar download card.
 */
@Composable
fun BodyScanResultsPanel(
    measurement: BodyScanMeasurement?,
    scan: BodyScanListItem? = null,
    showAvatar: Boolean = true,
    modifier: Modifier = Modifier,
) {
    val m = measurement
    val circ = m?.circumference_params
    val mass = m.resolveBodyMass(scan?.weightKg)
    var units by rememberSaveable { mutableStateOf(BodyScanUnits.Metric) }
    var showMore by rememberSaveable { mutableStateOf(false) }

    val heightCm = (m?.height ?: scan?.heightCm)?.toDouble()
    val weightKg = m?.weight ?: scan?.weightKg?.toDouble()
    val estimatedWeight = m?.estimated_weight
    val bmi = m?.bmi ?: m?.estimated_bmi
    val estimatedBmi = m?.estimated_bmi
    val age = m?.age ?: scan?.age
    val genderRaw = (m?.gender ?: scan?.gender).orEmpty()
    val genderLabel = when {
        genderRaw.isBlank() -> "—"
        else -> genderRaw.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
    val dateValue = m?.created_at ?: scan?.createdAt ?: m?.completed_at
    val statusOk =
        (m?.status ?: scan?.status) == "successful" || scan?.status == "successful"
    val deletionLabel = photoDeletionLabel(m, scan)

    val bust = circ.jsonNumber("chest")
        ?: circ.jsonNumber("upper_chest_girth")
        ?: circ.jsonNumber("bust")
    val waist = circ.jsonNumber("waist")
    val hips = circ.jsonNumber("low_hips") ?: circ.jsonNumber("high_hips")
    val bodyType = circ.jsonString("body_type")

    val additionalCirc = remember(circ) {
        circ?.entries
            ?.filter { entry ->
                entry.key !in CoreCircKeys &&
                    entry.key != "body_type" &&
                    (entry.value.jsonNumber() != null || !entry.value.jsonString().isNullOrBlank())
            }
            ?: emptyList()
    }
    val additionalLinear = remember(m) {
        buildList {
            m?.front_linear_params?.entries?.forEach { entry ->
                val v = entry.value
                if (v.jsonNumber() != null || v.jsonString() != null) add(Triple("front_${entry.key}", v, "cm"))
            }
            m?.side_linear_params?.entries?.forEach { entry ->
                val v = entry.value
                if (v.jsonNumber() != null || v.jsonString() != null) add(Triple("side_${entry.key}", v, "cm"))
            }
            m?.volume_params?.entries?.forEach { entry ->
                val v = entry.value
                if (v.jsonNumber() != null || v.jsonString() != null) add(Triple(entry.key, v, ""))
            }
        }
    }
    val hasMore = additionalCirc.isNotEmpty() || additionalLinear.isNotEmpty() || !bodyType.isNullOrBlank()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(PageBg, RoundedCornerShape(8.dp))
            .padding(4.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        ResultsCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                SectionHeading("Person information")
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        if (units == BodyScanUnits.Imperial) "Imperial" else "Metric",
                        color = HeadingBlue,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp,
                    )
                    Switch(
                        checked = units == BodyScanUnits.Imperial,
                        onCheckedChange = {
                            units = if (it) BodyScanUnits.Imperial else BodyScanUnits.Metric
                        },
                    )
                }
            }
            FieldGrid(
                listOf(
                    "Date" to formatScanDateDisplay(dateValue),
                    "Gender" to genderLabel,
                    "Weight" to formatMass(weightKg, units),
                    "Height" to formatLength(heightCm, units),
                    "Age" to (age?.toString() ?: "—"),
                ),
            )
        }

        ResultsCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f, fill = false),
                ) {
                    Icon(
                        Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = if (statusOk) Color(0xFF2E7D32) else Color(0xFF9E9E9E),
                    )
                    Text(
                        if (statusOk) {
                            "Passed measurement successfully"
                        } else {
                            "Status: ${m?.status ?: scan?.status ?: "—"}"
                        },
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF333333),
                        fontSize = 14.sp,
                    )
                }
                if (deletionLabel != null) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            Icons.Filled.Flag,
                            contentDescription = null,
                            tint = HeadingBlue,
                            modifier = Modifier.size(18.dp),
                        )
                        Text(
                            "Photos will be completely deleted | $deletionLabel",
                            color = Color(0xFF555555),
                            fontSize = 12.sp,
                        )
                    }
                }
            }
        }

        ResultsCard {
            SectionHeading("Estimated body data")
            FieldGrid(
                listOf(
                    "Estimated weight" to formatMass(estimatedWeight ?: weightKg, units),
                    "Estimated BMI" to formatPlain(estimatedBmi ?: bmi),
                    "Estimated lean body mass" to formatMass(mass.leanKg, units),
                    "Estimated fat body mass" to formatMass(mass.fatKg, units),
                ),
            )
        }

        ResultsCard {
            SectionHeading("Body data")
            val bodyFields = buildList {
                add("Fat" to formatPercent(m?.fat_percentage))
                val bmr = m?.bmr ?: m?.estimated_bmr
                if (bmr != null) add("BMR" to formatPlain(bmr))
                if (bmi != null) add("BMI" to formatPlain(bmi))
            }
            FieldGrid(bodyFields)
        }

        ResultsCard {
            SectionHeading("Core body measurements")
            FieldGrid(
                buildList {
                    add("Bust" to formatLength(bust, units))
                    add("Waist" to formatLength(waist, units))
                    add("Hips" to formatLength(hips, units))
                    if (!bodyType.isNullOrBlank()) add("Body type" to formatLabel(bodyType))
                },
            )
            if (hasMore) {
                TextButton(onClick = { showMore = !showMore }) {
                    Text(
                        if (showMore) "Show less" else "More",
                        color = HeadingBlue,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                if (showMore) {
                    if (additionalCirc.isNotEmpty()) {
                        Text(
                            "Additional circumferences",
                            color = HeadingBlue,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(bottom = 8.dp),
                        )
                        FieldGrid(
                            additionalCirc.map { entry ->
                                formatLabel(entry.key) to
                                    if (entry.key == "body_type") {
                                        formatLabel(entry.value.jsonString() ?: entry.value.toString())
                                    } else {
                                        formatLength(entry.value.jsonNumber(), units)
                                    }
                            },
                        )
                    }
                    if (additionalLinear.isNotEmpty()) {
                        Text(
                            "Linear & volume measurements",
                            color = HeadingBlue,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(top = 8.dp, bottom = 8.dp),
                        )
                        FieldGrid(
                            additionalLinear.map { row ->
                                formatLabel(row.first.removePrefix("front_").removePrefix("side_")) to
                                    if (row.third == "cm") {
                                        formatLength(row.second.jsonNumber(), units)
                                    } else {
                                        formatPlain(row.second.jsonNumber() ?: row.second.jsonString())
                                    }
                            },
                        )
                    }
                }
            }
        }

        if (showAvatar && statusOk) {
            AvatarCard(modelUrl = m?.model_3d_url)
        }
    }
}

@Composable
private fun AvatarCard(modelUrl: String?) {
    ResultsCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SectionHeading("3D Avatar")
            if (!modelUrl.isNullOrBlank()) {
                IconButton(onClick = { openExternalUrl(modelUrl) }) {
                    Icon(
                        Icons.Filled.Download,
                        contentDescription = "Download 3D model",
                        tint = Color(0xFF9E9E9E),
                    )
                }
            }
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(Color(0xFFFAFAFA), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(16.dp),
            ) {
                Text(
                    "Interactive 3D preview is available on the web chart.",
                    color = Color(0xFF666666),
                    fontSize = 13.sp,
                )
                if (!modelUrl.isNullOrBlank()) {
                    TextButton(onClick = { openExternalUrl(modelUrl) }) {
                        Text("Download .obj model", color = HeadingBlue, fontWeight = FontWeight.SemiBold)
                    }
                } else {
                    Text(
                        "No 3D model file for this scan — web chart shows a measurement-based avatar.",
                        color = Color(0xFF888888),
                        fontSize = 12.sp,
                    )
                }
            }
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp)
                .background(Color(0xCC555555), RoundedCornerShape(4.dp))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text("Use web chart to rotate the model", color = Color.White, fontSize = 13.sp)
        }
    }
}

@Composable
private fun ResultsCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), content = { content() })
    }
}

@Composable
private fun SectionHeading(text: String) {
    Text(
        text,
        color = HeadingBlue,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        modifier = Modifier.padding(bottom = 12.dp),
    )
}

@Composable
private fun FieldGrid(fields: List<Pair<String, String>>) {
    val rows = fields.chunked(2)
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        rows.forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                row.forEach { (label, value) ->
                    Column(modifier = Modifier.weight(1f)) {
                        Text(label, color = LabelGray, fontSize = 12.sp)
                        Spacer(Modifier.height(2.dp))
                        Text(
                            value,
                            color = Color(0xFF1A1A1A),
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                        )
                    }
                }
                if (row.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

private fun JsonObject?.jsonNumber(key: String): Double? = this?.get(key)?.jsonNumber()

private fun JsonObject?.jsonString(key: String): String? = this?.get(key)?.jsonString()

private fun JsonElement.jsonNumber(): Double? {
    val p = this as? JsonPrimitive ?: return null
    return p.doubleOrNull ?: p.contentOrNull?.toDoubleOrNull()
}

private fun JsonElement.jsonString(): String? {
    val p = this as? JsonPrimitive ?: return null
    return p.contentOrNull?.takeIf { it.isNotBlank() }
}

private fun formatLabel(key: String): String =
    key.replace('_', ' ').split(' ').joinToString(" ") { part ->
        part.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }

private fun formatLength(cm: Double?, units: BodyScanUnits): String {
    if (cm == null) return "—"
    return if (units == BodyScanUnits.Imperial) {
        "${round2(cm / 2.54)} in"
    } else {
        "${round1(cm)} cm"
    }
}

private fun formatMass(kg: Double?, units: BodyScanUnits): String {
    if (kg == null) return "—"
    return if (units == BodyScanUnits.Imperial) {
        "${round1(kg * 2.2046226218)} lb"
    } else {
        "${round1(kg)} kg"
    }
}

private fun formatPercent(value: Double?): String =
    if (value == null) "—" else "${round2(value)}%"

private fun formatPlain(value: Any?): String {
    if (value == null) return "—"
    val n = when (value) {
        is Number -> value.toDouble()
        is String -> value.toDoubleOrNull()
        else -> null
    }
    return if (n != null) round2(n).toString() else value.toString()
}

private fun round1(n: Double): Double = round(n * 10.0) / 10.0

private fun round2(n: Double): Double = round(n * 100.0) / 100.0

/** Rough local-style display without platform datetime APIs. */
private fun formatScanDateDisplay(value: String?): String {
    if (value.isNullOrBlank()) return "—"
    val date = value.take(10)
    val parts = date.split('-')
    if (parts.size != 3) return value
    val timePart = value.drop(11).take(5)
    val hour = timePart.take(2).toIntOrNull()
    val minute = timePart.drop(3).take(2)
    val timeLabel = if (hour != null && minute.isNotBlank()) {
        val amPm = if (hour >= 12) "PM" else "AM"
        val h12 = when {
            hour == 0 -> 12
            hour > 12 -> hour - 12
            else -> hour
        }
        ", $h12:$minute $amPm"
    } else {
        ""
    }
    return "${parts[1]}/${parts[2]}/${parts[0].takeLast(2)}$timeLabel"
}

private fun photoDeletionLabel(m: BodyScanMeasurement?, scan: BodyScanListItem?): String? {
    val raw = m?.photos_deleted_at ?: m?.photo_deletion_date ?: m?.data_retention_until
    if (!raw.isNullOrBlank()) {
        val d = raw.take(10).split('-')
        if (d.size == 3) return "${d[2]}.${d[1]}.${d[0]}"
        return raw.take(10)
    }
    val base = (m?.created_at ?: scan?.createdAt ?: m?.completed_at)?.take(10) ?: return null
    val parts = base.split('-').mapNotNull { it.toIntOrNull() }
    if (parts.size != 3) return null
    // Approximate +30 days on calendar (good enough for retention label).
    var y = parts[0]
    var mo = parts[1]
    var day = parts[2] + 30
    val dim = intArrayOf(31, if (y % 4 == 0) 29 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
    while (day > dim[mo - 1]) {
        day -= dim[mo - 1]
        mo++
        if (mo > 12) {
            mo = 1
            y++
        }
    }
    fun pad2(n: Int) = n.toString().padStart(2, '0')
    return "${pad2(day)}.${pad2(mo)}.$y"
}
