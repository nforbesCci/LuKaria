package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.core.PlatformConfig
import com.lukariagroup.app.core.todayIsoDate
import com.lukariagroup.app.data.models.BodyScanCreateRequest
import com.lukariagroup.app.data.models.BodyScanListItem
import com.lukariagroup.app.data.models.BodyScanMeasurement
import com.lukariagroup.app.data.models.PatientProfile
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
import kotlin.math.roundToInt

private enum class BodyScanUnits { Metric, Imperial }

private fun apiErrorMessage(throwable: Throwable): String =
    "${throwable.message ?: "Request failed"} (API: ${PlatformConfig.apiBaseUrl})"

private fun normalizeGender(sex: String?, gender: String?): String {
    val raw = (gender ?: sex).orEmpty().trim().lowercase()
    return when {
        raw.startsWith("m") -> "male"
        raw.startsWith("f") -> "female"
        else -> "female"
    }
}

private fun ageYearsFromDob(dob: String?): Int? {
    val parts = dob?.trim()?.take(10)?.split("-").orEmpty()
    if (parts.size != 3) return null
    val y = parts[0].toIntOrNull() ?: return null
    val m = parts[1].toIntOrNull() ?: return null
    val d = parts[2].toIntOrNull() ?: return null
    val today = todayIsoDate().split("-")
    if (today.size != 3) return null
    val ty = today[0].toIntOrNull() ?: return null
    val tm = today[1].toIntOrNull() ?: return null
    val td = today[2].toIntOrNull() ?: return null
    var age = ty - y
    if (tm < m || (tm == m && td < d)) age -= 1
    return age.takeIf { it in 16..120 }
}

private fun heightCmFromImperial(feet: Int?, inches: Double?): Int? {
    if (feet == null && inches == null) return null
    val totalInches = (feet ?: 0) * 12.0 + (inches ?: 0.0)
    if (totalInches <= 0) return null
    return (totalInches * 2.54).roundToInt()
}

private fun kgFromLb(lb: Double?): Int? =
    lb?.takeIf { it > 0 }?.div(2.2046226218)?.roundToInt()

private fun format1(value: Double): String =
    ((value * 10.0).roundToInt() / 10.0).toString().trimEnd('0').trimEnd('.')

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BodyScanScreen(onBack: () -> Unit) {
    var units by remember { mutableStateOf(BodyScanUnits.Imperial) }
    var heightCm by remember { mutableStateOf("") }
    var heightFeet by remember { mutableStateOf("") }
    var heightInches by remember { mutableStateOf("") }
    var weightKg by remember { mutableStateOf("") }
    var weightLb by remember { mutableStateOf("") }
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
    var prefilled by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    val resolvedHeightCm = when (units) {
        BodyScanUnits.Metric -> heightCm.toDoubleOrNull()?.roundToInt()
        BodyScanUnits.Imperial -> heightCmFromImperial(
            heightFeet.toIntOrNull(),
            heightInches.toDoubleOrNull(),
        )
    }
    val heightValid = resolvedHeightCm != null && resolvedHeightCm in 145..220
    val photosReady = frontPhoto != null && sidePhoto != null
    val canStart = photosReady && heightValid

    fun applyProfilePrefill(profile: PatientProfile?, latestWeightLbs: Double?) {
        if (prefilled) return
        prefilled = true
        units = BodyScanUnits.Imperial
        profile?.heightFeet?.let { heightFeet = it.toString() }
        profile?.heightInches?.let { heightInches = it.toString() }
        val cm = heightCmFromImperial(profile?.heightFeet, profile?.heightInches?.toDouble())
        if (cm != null) heightCm = cm.toString()

        val lbs = latestWeightLbs ?: profile?.startingWeight
        if (lbs != null && lbs > 0) {
            weightLb = format1(lbs)
            weightKg = kgFromLb(lbs)?.toString().orEmpty()
        }

        ageYearsFromDob(profile?.dateOfBirth)?.let { age = it.toString() }
        gender = normalizeGender(profile?.sex, profile?.gender)
    }

    fun switchUnits(next: BodyScanUnits) {
        if (next == units) return
        if (next == BodyScanUnits.Metric) {
            heightCmFromImperial(heightFeet.toIntOrNull(), heightInches.toDoubleOrNull())
                ?.let { heightCm = it.toString() }
            kgFromLb(weightLb.toDoubleOrNull())?.let { weightKg = it.toString() }
        } else {
            val cm = heightCm.toDoubleOrNull()
            if (cm != null && cm > 0) {
                val totalIn = cm / 2.54
                val feet = (totalIn / 12.0).toInt()
                val inches = totalIn - feet * 12.0
                heightFeet = feet.toString()
                heightInches = format1(inches)
            }
            weightKg.toDoubleOrNull()?.let { kg ->
                weightLb = format1(kg * 2.2046226218)
            }
        }
        units = next
    }

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

    LaunchedEffect(Unit) {
        refreshHistory()
        val profile = runCatching { AppContainer.profileRepository.fetch().profile }.getOrNull()
        val latestLbs = runCatching {
            AppContainer.measurementRepository.fetchAll().measurements
                .firstOrNull { it.weight != null }
                ?.weight
        }.getOrNull()
        applyProfilePrefill(profile, latestLbs)
    }

    LukariaScaffold(title = "Body scan", onBack = onBack) {
        BodyCopy(
            "Use the 3DLOOK AI camera for guided front and side photos, then submit for FitXpress measurements.",
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

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = units == BodyScanUnits.Imperial,
                    onClick = { switchUnits(BodyScanUnits.Imperial) },
                    label = { Text("Imperial (ft/in, lb)") },
                )
                FilterChip(
                    selected = units == BodyScanUnits.Metric,
                    onClick = { switchUnits(BodyScanUnits.Metric) },
                    label = { Text("Metric (cm, kg)") },
                )
            }

            if (units == BodyScanUnits.Metric) {
                OutlinedTextField(
                    value = heightCm,
                    onValueChange = { heightCm = it },
                    label = { Text("Height (cm)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Decimal,
                        imeAction = ImeAction.Next,
                    ),
                )
                OutlinedTextField(
                    value = weightKg,
                    onValueChange = { weightKg = it },
                    label = { Text("Weight (kg, optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Decimal,
                        imeAction = ImeAction.Next,
                    ),
                )
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    OutlinedTextField(
                        value = heightFeet,
                        onValueChange = { heightFeet = it },
                        label = { Text("Height (ft)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Number,
                            imeAction = ImeAction.Next,
                        ),
                    )
                    OutlinedTextField(
                        value = heightInches,
                        onValueChange = { heightInches = it },
                        label = { Text("Inches") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Decimal,
                            imeAction = ImeAction.Next,
                        ),
                    )
                }
                OutlinedTextField(
                    value = weightLb,
                    onValueChange = { weightLb = it },
                    label = { Text("Weight (lb, optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Decimal,
                        imeAction = ImeAction.Next,
                    ),
                )
            }

            OutlinedTextField(
                value = age,
                onValueChange = { age = it },
                label = { Text("Age (optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number,
                    imeAction = ImeAction.Done,
                ),
                keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
            )
            OutlinedButton(
                onClick = { gender = if (gender == "female") "male" else "female" },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Gender: $gender (tap to switch)") }

            if (!heightValid && (heightCm.isNotBlank() || heightFeet.isNotBlank() || heightInches.isNotBlank())) {
                ErrorText("Height must be between 145–220 cm (about 4'9\"–7'3\").")
            }

            Button(
                onClick = {
                    error = null
                    focusManager.clearFocus()
                    launchLookCamera()
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    when {
                        photosReady -> "Retake with AI camera"
                        else -> "Open AI camera capture"
                    },
                )
            }

            Text(
                "Photos: front=${if (frontPhoto != null) "ready" else "missing"} · " +
                    "side=${if (sidePhoto != null) "ready" else "missing"}",
            )
            if (!photosReady) {
                BodyCopy("Capture front and side photos to enable Start body scan.")
            }

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
                    focusManager.clearFocus()
                    val height = resolvedHeightCm
                    val front = frontPhoto
                    val side = sidePhoto
                    if (height == null || height !in 145..220) {
                        error = "Height must be between 145 and 220 cm (or equivalent imperial)"
                        return@Button
                    }
                    if (front == null || side == null) {
                        error = "Front and side photos are required"
                        return@Button
                    }
                    val weightForApi = when (units) {
                        BodyScanUnits.Metric -> weightKg.toDoubleOrNull()?.roundToInt()
                        BodyScanUnits.Imperial -> kgFromLb(weightLb.toDoubleOrNull())
                    }
                    scope.launch {
                        submitting = true
                        error = null
                        message = null
                        try {
                            val created = AppContainer.bodyScanRepository.create(
                                BodyScanCreateRequest(
                                    height = height,
                                    weight = weightForApi,
                                    gender = gender,
                                    age = age.toIntOrNull(),
                                    frontPhoto = front,
                                    sidePhoto = side,
                                ),
                            )
                            status = created.status
                            current = created.measurement
                            val id = created.measurementId
                            if (id != null && created.status != "successful" && created.status != "failed") {
                                message = "Scan started — waiting for results…"
                                var finished = false
                                repeat(45) {
                                    delay(4000)
                                    val polled = runCatching {
                                        AppContainer.bodyScanRepository.status(id)
                                    }.getOrElse { pollError ->
                                        error = apiErrorMessage(pollError)
                                        return@repeat
                                    }
                                    status = polled.status
                                    current = polled.measurement
                                    if (polled.status == "successful" || polled.status == "failed") {
                                        finished = true
                                        return@repeat
                                    }
                                }
                                if (!finished && error == null) {
                                    error = "Timed out waiting for scan results"
                                }
                            }
                            refreshHistory()
                        } catch (t: Throwable) {
                            error = apiErrorMessage(t)
                        } finally {
                            submitting = false
                        }
                    }
                },
                enabled = canStart,
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
