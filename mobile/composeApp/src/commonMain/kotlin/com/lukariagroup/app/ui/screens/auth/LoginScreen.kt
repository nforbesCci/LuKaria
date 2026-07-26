package com.lukariagroup.app.ui.screens.auth

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.auth.AuthViewModel
import com.lukariagroup.app.core.PlatformConfig
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
        BodyCopy("Sign in with Auth0, or paste a development access token that the API accepts as Bearer auth.")

        Button(
            onClick = { authViewModel.openNativeLogin() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Continue with Auth0")
        }

        Text(
            "Callback: ${PlatformConfig.auth0CallbackUrl}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        SectionTitle("Dev token paste")
        OutlinedTextField(
            value = state.pastedToken,
            onValueChange = authViewModel::onTokenChanged,
            modifier = Modifier.fillMaxWidth().height(140.dp),
            label = { Text("Access token") },
            placeholder = { Text("eyJhbGciOi…") },
            minLines = 4,
        )
        ErrorText(state.error)
        OutlinedButton(
            onClick = { authViewModel.loginWithPastedToken() },
            enabled = !state.isLoading && state.pastedToken.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (state.isLoading) "Signing in…" else "Use pasted token")
        }
    }
}
