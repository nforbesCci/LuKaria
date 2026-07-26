package com.lukariagroup.app.ui.screens.admin

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.MeasurementEntry
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import com.lukariagroup.app.ui.components.WeightChartPoint
import com.lukariagroup.app.ui.components.WeightTrendChart

@Composable
fun AdminWeightLoggingScreen(userId: String, onBack: () -> Unit) {
    var measurements by remember { mutableStateOf<List<MeasurementEntry>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(userId) {
        loading = true
        runCatching {
            val m = AppContainer.adminRepository.fetchMeasurements(userId, daysBack = 28)
            val p = AppContainer.adminRepository.fetchProfile(userId)
            m to p
        }.onSuccess { (m, p) ->
            measurements = m.measurements
            patientName = p.profile?.name ?: userId
            error = null
        }.onFailure { error = it.message }
        loading = false
    }

    val chartPoints = measurements
        .mapNotNull { entry ->
            val w = entry.weight ?: return@mapNotNull null
            WeightChartPoint(label = entry.displayDate ?: "", weight = w)
        }
        .asReversed()

    LukariaScaffold(title = "Weight Logging", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)

        AdminGeneratePdfButton(
            title = "Weight Logging",
            patientName = patientName,
            sections = {
                listOf(
                    AdminPdfSection(
                        "History (28 days)",
                        measurements.joinToString("\n") {
                            "${it.displayDate}: ${it.weight ?: "—"} ${it.unit}" +
                                (it.displayWaist?.let { w -> " · waist $w" } ?: "")
                        }.ifBlank { "No measurements" },
                    ),
                )
            },
        )

        SectionTitle("Trend")
        if (chartPoints.size >= 2) {
            WeightTrendChart(points = chartPoints)
        } else {
            BodyCopy("Not enough data for a trend chart.")
        }

        SectionTitle("History")
        if (measurements.isEmpty()) BodyCopy("No measurements in the last 28 days.")
        measurements.forEach { entry ->
            BodyCopy(
                "${entry.displayDate}: ${entry.weight ?: "—"} ${entry.unit}" +
                    (entry.displayWaist?.let { " · waist $it" } ?: ""),
            )
        }
    }
}
