package com.lukariagroup.app.ui.screens.marketing

import androidx.compose.runtime.Composable
import com.lukariagroup.app.ui.components.BodyCopy
import com.lukariagroup.app.ui.components.LukariaScaffold
import com.lukariagroup.app.ui.components.SectionTitle

@Composable
fun PrivacyPolicyScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "Privacy Policy", onBack = onBack) {
        SectionTitle("Summary")
        BodyCopy(
            "Lukaria collects account, clinical, and device information needed to deliver telehealth care. " +
                "We do not sell personal health information. Full policy: lukariagroup.com/privacy-policy",
        )
    }
}

@Composable
fun TermsOfServiceScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "Terms of Service", onBack = onBack) {
        SectionTitle("Summary")
        BodyCopy(
            "Use of the Lukaria app is subject to our terms, including appropriate use of telehealth, " +
                "membership billing, and clinical disclaimers. Full terms: lukariagroup.com",
        )
    }
}

@Composable
fun HipaaNoticeScreen(onBack: () -> Unit) {
    LukariaScaffold(title = "HIPAA Notice", onBack = onBack) {
        SectionTitle("Protected health information")
        BodyCopy(
            "We safeguard PHI under HIPAA. You may request access, amendments, and an accounting of disclosures. " +
                "Contact privacy@lukariagroup.com for privacy requests.",
        )
    }
}

/** Combined legal entry used by navigation for Privacy / Terms / HIPAA routes. */
@Composable
fun LegalScreens(kind: LegalKind, onBack: () -> Unit) {
    when (kind) {
        LegalKind.Privacy -> PrivacyPolicyScreen(onBack)
        LegalKind.Terms -> TermsOfServiceScreen(onBack)
        LegalKind.Hipaa -> HipaaNoticeScreen(onBack)
    }
}

enum class LegalKind { Privacy, Terms, Hipaa }
