package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.BodyScanListItem
import com.lukariagroup.app.data.models.resolveBodyMass
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.MetricChartPoint
import com.lukariagroup.app.ui.components.MetricTrendChart
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

private enum class BodyScanChartMetric(val label: String, val unit: String) {
    BMI("BMI", ""),
    WEIGHT("Weight", "kg"),
    FAT("Body fat %", "%"),
    BMR("BMR", ""),
}

@Composable
fun AdminBodyScanScreen(userId: String, onBack: () -> Unit) {
    var scans by remember { mutableStateOf<List<BodyScanListItem>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var selectedScan by remember { mutableStateOf<BodyScanListItem?>(null) }
    var chartMetric by remember { mutableStateOf(BodyScanChartMetric.BMI) }

    LaunchedEffect(userId) {
        loading = true
        runCatching {
            val list = AppContainer.adminRepository.fetchBodyScans(userId)
            val profile = AppContainer.adminRepository.fetchProfile(userId)
            list to profile
        }.onSuccess { (list, profile) ->
            scans = list.scans
            patientName = profile.profile?.name ?: userId
            error = null
        }.onFailure { error = it.message }
        loading = false
    }

    val chartPoints = remember(scans, chartMetric) {
        scans
            .asReversed()
            .filter { it.isSuccessful() }
            .mapNotNull { scan ->
                val value = scan.metricValue(chartMetric) ?: return@mapNotNull null
                val label = (scan.createdAt ?: scan.measurementId ?: "").take(10)
                MetricChartPoint(label = label.ifBlank { "—" }, value = value)
            }
    }

    if (selectedScan != null) {
        val scan = selectedScan!!
        LukariaScaffold(title = "Scan detail", onBack = { selectedScan = null }) {
            ScanDetailContent(scan)
        }
        return
    }

    LukariaScaffold(title = "Body Scan", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)

        AdminGeneratePdfButton(
            title = "Body Scan",
            patientName = patientName,
            sections = {
                listOf(
                    AdminPdfSection(
                        "Scan history",
                        scans.joinToString("\n\n") { scan ->
                            val m = scan.measurement
                            buildString {
                                append(scan.createdAt ?: scan.measurementId ?: "—")
                                append(" · ")
                                append(scan.status ?: "?")
                                append("\nBMI ")
                                append(m?.bmi ?: m?.estimated_bmi ?: "—")
                                append(" · Fat ")
                                append(m?.fat_percentage ?: "—")
                                append("% · Weight ")
                                append(m?.weight ?: m?.estimated_weight ?: scan.weightKg ?: "—")
                                append(" kg · BMR ")
                                append(m?.bmr ?: m?.estimated_bmr ?: "—")
                            }
                        }.ifBlank { "No body scans" },
                    ),
                )
            },
        )

        SectionTitle("Progress")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            BodyScanChartMetric.entries.forEach { metric ->
                FilterChip(
                    selected = chartMetric == metric,
                    onClick = { chartMetric = metric },
                    label = { Text(metric.label) },
                )
            }
        }
        MetricTrendChart(
            points = chartPoints,
            unitLabel = chartMetric.unit,
            emptyMessage = "Need at least two successful scans with this metric to show a chart.",
            onePointMessage = "One successful scan so far — add another to graph progress.",
            footerNoun = "scans",
        )

        SectionTitle("Scans")
        if (scans.isEmpty()) {
            BodyCopy("No body scans for this patient.")
        }
        scans.forEach { scan ->
            ScanCard(scan = scan, onClick = { selectedScan = scan })
        }
    }
}

@Composable
private fun ScanCard(scan: BodyScanListItem, onClick: () -> Unit) {
    val m = scan.measurement
    val ok = scan.isSuccessful()
    val failed = (scan.status ?: m?.status) == "failed"
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = when {
                failed -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.35f)
                ok -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                else -> MaterialTheme.colorScheme.surfaceVariant
            },
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    scan.createdAt ?: "—",
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    scan.status ?: m?.status ?: "unknown",
                    style = MaterialTheme.typography.labelMedium,
                    color = when {
                        ok -> MaterialTheme.colorScheme.primary
                        failed -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )
            }
            Text(
                "BMI ${formatScanValue(m?.bmi ?: m?.estimated_bmi)}",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                "Fat ${formatScanValue(m?.fat_percentage, "%")}",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.secondary,
            )
            Text(
                "Weight ${formatScanValue(m?.weight ?: m?.estimated_weight ?: scan.weightKg, " kg")}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun ScanDetailContent(scan: BodyScanListItem) {
    val m = scan.measurement
    val failed = (scan.status ?: m?.status) == "failed"
    val mass = m.resolveBodyMass(scan.weightKg)

    BodyCopy("Date: ${scan.createdAt ?: "—"}")
    BodyCopy("Status: ${scan.status ?: m?.status ?: "—"}")
    BodyCopy("Height: ${formatScanValue(scan.heightCm ?: m?.height, " cm")}")
    BodyCopy("Gender: ${scan.gender ?: m?.gender ?: "—"}")
    BodyCopy("Age: ${formatScanValue(scan.age ?: m?.age)}")
    BodyCopy("BMI: ${formatScanValue(m?.bmi ?: m?.estimated_bmi)}")
    BodyCopy("Body fat %: ${formatScanValue(m?.fat_percentage, "%")}")
    BodyCopy("Weight: ${formatScanValue(m?.weight ?: m?.estimated_weight ?: scan.weightKg, " kg")}")
    BodyCopy("BMR: ${formatScanValue(m?.bmr ?: m?.estimated_bmr)}")
    BodyCopy("Lean mass: ${formatScanValue(mass.leanKg, " kg")}")
    BodyCopy("Fat mass: ${formatScanValue(mass.fatKg, " kg")}")

    val circ = m?.circumference_params
    if (circ != null && circ.isNotEmpty()) {
        SectionTitle("Circumference")
        circ.entries.forEach { (key, el) ->
            val value = (el as? JsonPrimitive)?.contentOrNull ?: el.toString()
            BodyCopy("${key.replace('_', ' ')}: $value")
        }
    }

    if (failed && !m?.errors.isNullOrEmpty()) {
        SectionTitle("Errors")
        m?.errors?.forEach { err ->
            BodyCopy(err.detail ?: err.description ?: "Error")
        }
    }
}

private fun BodyScanListItem.isSuccessful(): Boolean =
    status == "successful" || measurement?.status == "successful"

private fun BodyScanListItem.metricValue(metric: BodyScanChartMetric): Double? {
    val m = measurement
    val raw: Any? = when (metric) {
        BodyScanChartMetric.BMI -> m?.bmi ?: m?.estimated_bmi
        BodyScanChartMetric.WEIGHT -> m?.weight ?: m?.estimated_weight ?: weightKg
        BodyScanChartMetric.FAT -> m?.fat_percentage
        BodyScanChartMetric.BMR -> m?.bmr ?: m?.estimated_bmr
    }
    return when (raw) {
        null -> null
        is Number -> raw.toDouble()
        is String -> raw.toDoubleOrNull()
        else -> null
    }
}

private fun formatScanValue(value: Any?, suffix: String = ""): String {
    if (value == null) return "—"
    val n = when (value) {
        is Number -> value.toDouble()
        is String -> value.toDoubleOrNull()
        else -> null
    }
    if (n != null) {
        val rounded = kotlin.math.round(n * 10.0) / 10.0
        val text = if (rounded == rounded.toLong().toDouble()) {
            rounded.toLong().toString()
        } else {
            rounded.toString()
        }
        return text + suffix
    }
    return "$value$suffix"
}
