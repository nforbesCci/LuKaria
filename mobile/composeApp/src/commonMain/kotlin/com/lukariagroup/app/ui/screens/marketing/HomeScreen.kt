package com.lukariagroup.app.ui.screens.marketing

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.lukariagroup.app.core.openWhatsAppChat
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.theme.LukariaGold
import com.lukariagroup.app.ui.theme.LukariaGoldDark
import lukaria.composeapp.generated.resources.Res
import lukaria.composeapp.generated.resources.svelte_logo
import org.jetbrains.compose.resources.painterResource

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    isLoggedIn: Boolean,
    isStaff: Boolean,
    userDisplayName: String?,
    onNavigate: (String) -> Unit,
    onLogin: () -> Unit,
    onLogout: () -> Unit,
    onDashboard: () -> Unit,
    onAdmin: () -> Unit,
) {
    LukariaScaffold(title = "Svelte") {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(
                    Brush.verticalGradient(listOf(LukariaGoldDark, LukariaGold, LukariaGoldDark)),
                    RoundedCornerShape(16.dp),
                )
                .padding(horizontal = 24.dp, vertical = 28.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Image(
                    painter = painterResource(Res.drawable.svelte_logo),
                    contentDescription = "Svelte by LuKaria",
                    modifier = Modifier.size(112.dp),
                    contentScale = ContentScale.Fit,
                )
                Text(
                    "Svelte by LuKaria",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onPrimary,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                )
                Text(
                    "clinical weight management and telehealth",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.95f),
                    textAlign = TextAlign.Center,
                )
            }
        }

        BodyCopy("Personalized GLP-1 care, appointments, labs, and daily tracking — in one place.")

        if (isLoggedIn) {
            val greetingName = userDisplayName?.takeIf { it.isNotBlank() } ?: "there"
            Text(
                "Hi $greetingName",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
                Text("Log out")
            }
            Button(onClick = onDashboard, modifier = Modifier.fillMaxWidth()) {
                Text("Open patient dashboard")
            }
            if (isStaff) {
                OutlinedButton(onClick = onAdmin, modifier = Modifier.fillMaxWidth()) {
                    Text("Admin console")
                }
            }
        } else {
            Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) {
                Text("Log in")
            }
        }

        OutlinedButton(
            onClick = { openWhatsAppChat("18762903659") },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Chat on WhatsApp")
        }

        val links = listOf(
            "info" to "How it works",
            "about" to "About",
            "services" to "Services",
            "faq" to "FAQ",
            "testimonials" to "Testimonials",
            "blog" to "Blog",
            "contact" to "Contact",
            "privacy" to "Privacy",
        )
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp),
        ) {
            links.forEach { (route, label) ->
                TextButton(onClick = { onNavigate(route) }) {
                    Text(label)
                }
            }
        }
    }
}
