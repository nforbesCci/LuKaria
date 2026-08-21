package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.data.models.BodyScanListItem
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

@Composable
fun AdminBodyScanScreen(userId: String, onBack: () -> Unit) {
    var scans by remember { mutableStateOf<List<BodyScanListItem>>(emptyList()) }
    var patientName by remember { mutableStateOf(userId) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

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

    val latestOk = scans.firstOrNull {
        it.status == "successful" || it.measurement?.status == "successful"
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

        SectionTitle("Latest successful scan")
        if (latestOk?.measurement == null) {
            BodyCopy("No successful scans yet.")
        } else {
            val m = latestOk.measurement
            BodyCopy("Date: ${latestOk.createdAt ?: "—"}")
            BodyCopy("BMI: ${m?.bmi ?: m?.estimated_bmi ?: "—"}")
            BodyCopy("Body fat %: ${m?.fat_percentage ?: "—"}")
            BodyCopy("Weight (kg): ${m?.weight ?: m?.estimated_weight ?: latestOk.weightKg ?: "—"}")
            BodyCopy("BMR: ${m?.bmr ?: m?.estimated_bmr ?: "—"}")
            m?.circumference_params?.entries?.take(12)?.forEach { (key, el) ->
                val value = (el as? JsonPrimitive)?.contentOrNull ?: el.toString()
                Text(
                    "${key.replace('_', ' ')}: $value",
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }

        SectionTitle("History")
        if (scans.isEmpty()) BodyCopy("No body scans for this patient.")
        scans.forEach { scan ->
            val m = scan.measurement
            BodyCopy(
                "${scan.createdAt ?: "—"} · ${scan.status ?: "?"} · " +
                    "BMI ${m?.bmi ?: m?.estimated_bmi ?: "—"} · " +
                    "fat ${m?.fat_percentage ?: "—"}%",
            )
        }
    }
}
