package com.lukariagroup.app.ui.screens.patient

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
import com.lukariagroup.app.data.models.PatientProfile
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LoadingBlock
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun MembershipScreen(onBack: () -> Unit) {
    var profile by remember { mutableStateOf<PatientProfile?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        runCatching { AppContainer.profileRepository.fetch() }
            .onSuccess { profile = it.profile; error = null }
            .onFailure { error = it.message }
        loading = false
    }

    LukariaScaffold(title = "Membership", onBack = onBack) {
        if (loading) LoadingBlock()
        ErrorText(error)
        SectionTitle("Your plan")
        BodyCopy("Tier: ${profile?.membershipTier ?: "—"}")
        BodyCopy("Status: ${profile?.membershipStatus ?: "—"}")
        BodyCopy(
            "Membership includes clinician follow-ups, medication coordination, and access to tracking tools. " +
                "Manage billing on the Lukaria website if needed.",
        )
    }
}
