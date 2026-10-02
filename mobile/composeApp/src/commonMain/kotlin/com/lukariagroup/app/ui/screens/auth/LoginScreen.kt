package com.lukariagroup.app.ui.screens.auth

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.lukariagroup.app.auth.AuthViewModel
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.ErrorText
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun LoginScreen(
    authViewModel: AuthViewModel,
    onBack: () -> Unit,
    onLoggedIn: () -> Unit,
) {
    val state by authViewModel.uiState.collectAsState()

    LaunchedEffect(state.isLoggedIn, state.user) {
        if (state.isLoggedIn && state.user != null) onLoggedIn()
    }

    LukariaScaffold(title = "Sign in", onBack = onBack) {
        SectionTitle("Svelte account")
        BodyCopy("Sign in or create an account with your email, Google or Apple.")

        Button(
            onClick = { authViewModel.openNativeLogin() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Sign in or create account")
        }

        ErrorText(state.error)
    }
}
