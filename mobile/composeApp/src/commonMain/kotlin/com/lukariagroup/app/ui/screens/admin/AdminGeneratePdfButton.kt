package com.lukariagroup.app.ui.screens.admin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.core.AdminPdfSection
import com.lukariagroup.app.core.exportAdminTabPdf
import com.lukariagroup.app.ui.components.ErrorText

@Composable
fun AdminGeneratePdfButton(
    title: String,
    patientName: String,
    sections: () -> List<AdminPdfSection>,
    modifier: Modifier = Modifier,
) {
    var status by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    OutlinedButton(
        onClick = {
            runCatching { exportAdminTabPdf(title, patientName, sections()) }
                .onSuccess {
                    status = it
                    error = null
                }
                .onFailure {
                    error = it.message
                    status = null
                }
        },
        modifier = modifier.fillMaxWidth(),
    ) { Text("Generate PDF") }

    ErrorText(error)
    status?.let { Text(it) }
}
