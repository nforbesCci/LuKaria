package com.lukariagroup.app.ui.screens.marketing

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun InfoScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "How it works", onBack = onBack) {
        SectionTitle("Your care journey")
        BodyCopy("1. Complete your clinical profile and consent forms.")
        BodyCopy("2. Meet your Lukaria clinician via telehealth.")
        BodyCopy("3. Track weight, medications, meals, and side effects between visits.")
        BodyCopy("4. Stay on plan with membership support and secure messaging.")
        SectionTitle("What you need")
        Text("• Stable internet for video visits")
        Text("• A scale for weekly weight logging")
        Text("• Your pharmacy and insurance details")
    }
}

@Composable
fun AboutScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "About Svelte", onBack = onBack) {
        SectionTitle("Personalized Telemedicine delivery for your Metabolic Health")
        BodyCopy(
            "Svelte by LuKaria provides physician-led weight management with GLP-1 therapies, " +
                "lifestyle coaching, and continuous remote monitoring.",
        )
        BodyCopy("Our team includes Licensed medical doctors focused on safe, evidence-based care.")
    }
}

@Composable
fun FaqScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "FAQ", onBack = onBack) {
        SectionTitle("Which medications are offered?")
        BodyCopy("Semaglutide (Ozempic/Wegovy), Tirzepatide (Mounjaro)")
        SectionTitle("Is my data secure?")
        BodyCopy("We use Auth0 authentication and encrypted transport. See Privacy & HIPAA notices.")
    }
}

@Composable
fun ContactScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "Contact", onBack = onBack) {
        SectionTitle("Get in touch")
        BodyCopy("Email: info@lukariagroup.com")
        BodyCopy("Web: https://www.lukariagroup.com/contact")
        BodyCopy(
            "For clinical emergencies, call your local emergency number — " +
                "head to your nearest emergency room or urgent care center. " +
                "Do not use in-app messaging.",
        )
    }
}

@Composable
fun TestimonialsScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "Testimonials", onBack = onBack) {
        SectionTitle("Patient stories")
        BodyCopy("“The weekly check-ins and medication tracking kept me accountable.” — M.R.")
        BodyCopy("“Scheduling and consent forms on my phone made onboarding simple.” — J.K.")
        BodyCopy("“My clinician reviewed side effects the same day I logged them.” — A.T.")
    }
}

@Composable
fun ServiceMarketingScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "Services", onBack = onBack) {
        SectionTitle("Programs")
        BodyCopy("• Medical weight management with GLP-1 therapy")
        BodyCopy("• Telehealth consultations & follow-ups")
        BodyCopy("• Lab requisitions and results review")
        BodyCopy("• Nutrition & meal tracking support")
        BodyCopy("• Medication adherence monitoring")
    }
}
