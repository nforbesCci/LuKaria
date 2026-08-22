package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
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
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.data.models.BodyScanCreateRequest
import com.lukariagroup.app.data.models.BodyScanListItem
import com.lukariagroup.app.data.models.BodyScanMeasurement
import com.lukariagroup.app.data.models.resolveBodyMass
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

private fun apiErrorMessage(throwable: Throwable): String =
    "${throwable.message ?: "Request failed"} (API: ${PlatformConfig.apiBaseUrl})"

@Composable
fun BodyScanScreen(onBack: () -> Unit) {
    var heightCm by remember { mutableStateOf("") }
    var weightKg by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("female") }
    var frontPhoto by remember { mutableStateOf<String?>(null) }
    var sidePhoto by remember { mutableStateOf<String?>(null) }
    var pickingSlot by remember { mutableStateOf<String?>(null) }
    var history by remember { mutableStateOf<List<BodyScanListItem>>(emptyList()) }
    var current by remember { mutableStateOf<BodyScanMeasurement?>(null) }
    var status by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var submitting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val launchLookCamera = rememberLookCameraLauncher { capture ->
        if (capture.frontDataUrl == null && capture.sideDataUrl == null) {
            error = "Camera capture cancelled or unavailable."
            return@rememberLookCameraLauncher
        }
        frontPhoto = capture.frontDataUrl ?: frontPhoto
        sidePhoto = capture.sideDataUrl ?: sidePhoto
        error = null
        message = when {
            frontPhoto != null && sidePhoto != null -> "AI camera photos ready — start the scan."
            frontPhoto != null -> "Front photo captured. Capture or pick the side photo."
            sidePhoto != null -> "Side photo captured. Capture or pick the front photo."
            else -> null
        }
    }

    val imageSources = rememberImageDataUrlSources { dataUrl ->
        when (pickingSlot) {
            "front" -> frontPhoto = dataUrl
            "side" -> sidePhoto = dataUrl
        }
        if (dataUrl == null) {
            error = "Could not load photo. Pick a gallery image and try again."
        } else {
            error = null
        }
        pickingSlot = null
    }

    fun refreshHistory() {
        scope.launch {
            loading = true
            runCatching { AppContainer.bodyScanRepository.list() }
                .onSuccess {
                    history = it.scans
                    error = null
                }
                .onFailure { error = apiErrorMessage(it) }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refreshHistory() }

    LukariaScaffold(title = "Body scan", onBack = onBack) {
        BodyCopy(
            "Use the 3DLOOK AI camera for guided front and side photos, then submit for FitXpress measurements. Height is in cm.",
        )
        BodyCopy(
            "Tips: form-fitting clothes, plain background, full body head-to-toe, arms slightly away from sides, good lighting.",
        )
        ErrorText(error)
        message?.let { Text(it) }

        if (submitting) {
            LoadingBlock()
            Text(if (status == "pending" || status == "in_progress") "Processing scan…" else "Uploading…")
        }

        if (status == "successful" && current != null) {
            val mass = current.resolveBodyMass()
            SectionTitle("Results")
            Text("Status: successful")
            Text("BMI: ${current?.bmi ?: current?.estimated_bmi ?: "—"}")
            Text("Body fat %: ${current?.fat_percentage ?: "—"}")
            Text("BMR: ${current?.bmr ?: current?.estimated_bmr ?: "—"}")
            Text("Weight (kg): ${current?.weight ?: current?.estimated_weight ?: "—"}")
            Text("Lean mass (kg): ${mass.leanKg ?: "—"}")
            Text("Fat mass (kg): ${mass.fatKg ?: "—"}")
            current?.circumference_params?.entries?.take(12)?.forEach { (key, el) ->
                val value = (el as? JsonPrimitive)?.contentOrNull ?: el.toString()
                Text("${key.replace('_', ' ')}: $value")
            }
            Button(
                onClick = {
                    status = null
                    current = null
                    frontPhoto = null
                    sidePhoto = null
                    message = null
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("New scan") }
        } else if (status == "failed") {
            SectionTitle("Scan failed")
            val failureDetail = current?.errors
                ?.mapNotNull { err ->
                    val source = err.error_source?.replace('_', ' ')
                    val msg = err.detail ?: err.description
                    when {
                        msg.isNullOrBlank() -> null
                        source.isNullOrBlank() -> msg
                        else -> "$source: $msg"
                    }
                }
                ?.joinToString("; ")
                ?.ifBlank { null }
                ?: "Check pose and lighting, then try again."
            Text(failureDetail)
            BodyCopy(
                "Retake both photos with the AI camera. Wear fitted clothing, stand fully in frame " +
                    "(head to feet), keep the camera upright, and use a plain background.",
            )
            Button(
                onClick = {
                    status = null
                    current = null
                    frontPhoto = null
                    sidePhoto = null
                    message = null
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Try again") }
        } else if (!submitting) {
            SectionTitle("New scan")
            OutlinedTextField(
                value = heightCm,
                onValueChange = { heightCm = it },
                label = { Text("Height (cm)") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = weightKg,
                onValueChange = { weightKg = it },
                label = { Text("Weight (kg, optional)") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = age,
                onValueChange = { age = it },
                label = { Text("Age (optional)") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedButton(
                onClick = { gender = if (gender == "female") "male" else "female" },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Gender: $gender (tap to switch)") }

            Button(
                onClick = {
                    error = null
                    launchLookCamera()
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    when {
                        frontPhoto != null && sidePhoto != null -> "Retake with AI camera"
                        else -> "Open AI camera capture"
                    },
                )
            }

            Text(
                "Photos: front=${if (frontPhoto != null) "ready" else "missing"} · " +
                    "side=${if (sidePhoto != null) "ready" else "missing"}",
            )

            SectionTitle("Or pick from gallery")
            OutlinedButton(
                onClick = {
                    pickingSlot = "front"
                    imageSources.pickGallery()
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (frontPhoto != null) "Change front photo" else "Pick front photo") }

            OutlinedButton(
                onClick = {
                    pickingSlot = "side"
                    imageSources.pickGallery()
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (sidePhoto != null) "Change side photo" else "Pick side photo") }

            Button(
                onClick = {
                    val height = heightCm.toIntOrNull()
                    val front = frontPhoto
                    val side = sidePhoto
                    if (height == null || height < 145 || height > 220) {
                        error = "Height must be between 145 and 220 cm"
                        return@Button
                    }
                    if (front == null || side == null) {
                        error = "Front and side photos are required"
                        return@Button
                    }
                    scope.launch {
                        submitting = true
                        error = null
                        message = null
                        runCatching {
                            AppContainer.bodyScanRepository.create(
                                BodyScanCreateRequest(
                                    height = height,
                                    weight = weightKg.toIntOrNull(),
                                    gender = gender,
                                    age = age.toIntOrNull(),
                                    frontPhoto = front,
                                    sidePhoto = side,
                                ),
                            )
                        }.onSuccess { created ->
                            status = created.status
                            current = created.measurement
                            val id = created.measurementId
                            if (id != null && created.status != "successful" && created.status != "failed") {
                                message = "Scan started — waiting for results…"
                                var finished = false
                                repeat(45) {
                                    delay(4000)
                                    val polled = AppContainer.bodyScanRepository.status(id)
                                    status = polled.status
                                    current = polled.measurement
                                    if (polled.status == "successful" || polled.status == "failed") {
                                        finished = true
                                        return@repeat
                                    }
                                }
                                if (!finished) {
                                    error = "Timed out waiting for scan results"
                                }
                            }
                            refreshHistory()
                        }.onFailure { error = apiErrorMessage(it) }
                        submitting = false
                    }
                },
                enabled = frontPhoto != null && sidePhoto != null && heightCm.toIntOrNull() != null,
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Start body scan") }
        }

        if (loading && history.isEmpty()) LoadingBlock()
        SectionTitle("Previous scans")
        if (history.isEmpty() && !loading) {
            Text("No scans yet.")
        }
        history.take(20).forEach { scan ->
            Text(
                "${scan.createdAt ?: scan.measurementId ?: "—"} · ${scan.status ?: "?"} · " +
                    "BMI ${scan.measurement?.bmi ?: "—"}",
            )
        }
    }
}
