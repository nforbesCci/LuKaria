package com.lukariagroup.app.ui.screens.patient

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.AppContainer
import com.lukariagroup.app.data.models.FoodProduct
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle
import kotlinx.coroutines.launch

@Composable
fun BarcodeScannerScreen(onBack: () -> Unit) {
    var barcode by remember { mutableStateOf("") }
    var product by remember { mutableStateOf<FoodProduct?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var scanning by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun lookup(code: String) {
        scope.launch {
            runCatching { AppContainer.foodRepository.findByBarcode(code.trim()) }
                .onSuccess {
                    product = it
                    if (it == null) error = "No product found for $code"
                    else error = null
                }
                .onFailure { error = it.message }
        }
    }

    val openScanner = rememberBarcodeScannerLauncher { scanned ->
        scanning = false
        if (scanned.isNullOrBlank()) {
            error = "Scan cancelled or camera unavailable. Enter a barcode manually."
            return@rememberBarcodeScannerLauncher
        }
        barcode = scanned
        error = null
        lookup(scanned)
    }

    LukariaScaffold(title = "Barcode scanner", onBack = onBack) {
        SectionTitle("Lookup food")
        BodyCopy("Scan a product barcode with the camera, or type the number and look it up.")

        OutlinedTextField(
            value = barcode,
            onValueChange = { barcode = it },
            label = { Text("Barcode") },
            modifier = Modifier.fillMaxWidth(),
        )
        ErrorText(error)
        product?.let {
            Text(it.productName ?: "Product")
            Text("Brand: ${it.brands ?: "—"}")
            Text("Calories: ${it.calories ?: "—"}  P:${it.protein ?: "—"} C:${it.carbs ?: "—"} F:${it.fat ?: "—"}")
        }

        OutlinedButton(
            onClick = {
                scanning = true
                error = null
                openScanner()
            },
            enabled = !scanning,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (scanning) "Opening camera…" else "Open camera scanner")
        }

        Button(
            onClick = { lookup(barcode) },
            enabled = barcode.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Lookup barcode")
        }
    }
}
