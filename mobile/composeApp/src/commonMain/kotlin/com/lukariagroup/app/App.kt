package com.lukariagroup.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.savedstate.read
import com.lukariagroup.app.ui.navigation.AppRoute
import com.lukariagroup.app.ui.screens.admin.AdminConsentFormsScreen
import com.lukariagroup.app.ui.screens.admin.AdminHomeScreen
import com.lukariagroup.app.ui.screens.admin.AdminMealTrackerScreen
import com.lukariagroup.app.ui.screens.admin.AdminMedicationScreen
import com.lukariagroup.app.ui.screens.admin.AdminPatientRescheduleScreen
import com.lukariagroup.app.ui.screens.admin.AdminPatientSideEffectsScreen
import com.lukariagroup.app.ui.screens.admin.AdminProfileSummaryScreen
import com.lukariagroup.app.ui.screens.admin.AdminQuestionsScreen
import com.lukariagroup.app.ui.screens.admin.AdminSettingsScreen
import com.lukariagroup.app.ui.screens.admin.AdminSideEffectsScreen
import com.lukariagroup.app.ui.screens.admin.AdminWeightLoggingScreen
import com.lukariagroup.app.ui.screens.admin.BlogCmsScreen
import com.lukariagroup.app.ui.screens.admin.LabRequisitionScreen
import com.lukariagroup.app.ui.screens.admin.PatientChartScreen
import com.lukariagroup.app.ui.screens.admin.RescheduleRequestsScreen
import com.lukariagroup.app.ui.screens.auth.LoginScreen
import com.lukariagroup.app.ui.screens.marketing.AboutScreen
import com.lukariagroup.app.ui.screens.marketing.BlogDetailScreen
import com.lukariagroup.app.ui.screens.marketing.BlogListScreen
import com.lukariagroup.app.ui.screens.marketing.ContactScreen
import com.lukariagroup.app.ui.screens.marketing.FaqScreen
import com.lukariagroup.app.ui.screens.marketing.HomeScreen
import com.lukariagroup.app.ui.screens.marketing.InfoScreen
import com.lukariagroup.app.ui.screens.marketing.LegalKind
import com.lukariagroup.app.ui.screens.marketing.LegalScreens
import com.lukariagroup.app.ui.screens.marketing.ServiceMarketingScreen
import com.lukariagroup.app.ui.screens.marketing.TestimonialsScreen
import com.lukariagroup.app.ui.screens.patient.BarcodeScannerScreen
import com.lukariagroup.app.ui.screens.patient.ConsentFormsScreen
import com.lukariagroup.app.ui.screens.patient.DashboardScreen
import com.lukariagroup.app.ui.screens.patient.MealTrackerScreen
import com.lukariagroup.app.ui.screens.patient.MedicationTrackerScreen
import com.lukariagroup.app.ui.screens.patient.MembershipScreen
import com.lukariagroup.app.ui.screens.patient.ProfileWizardScreen
import com.lukariagroup.app.ui.screens.patient.ScheduleScreen
import com.lukariagroup.app.ui.screens.patient.SideEffectsScreen
import com.lukariagroup.app.ui.screens.patient.WeightLoggingScreen
import com.lukariagroup.app.ui.theme.LukariaTheme

private fun androidx.navigation.NavBackStackEntry.argString(key: String): String =
    arguments?.read { getStringOrNull(key) }.orEmpty()

@Composable
fun App() {
    LukariaTheme {
        val navController = rememberNavController()
        val authViewModel = remember { AppContainer.authViewModel() }
        val authState by authViewModel.uiState.collectAsState()

        LaunchedEffect(Unit) {
            AppContainer.authRepository.restoreSession()
        }

        NavHost(
            navController = navController,
            startDestination = AppRoute.Home.route,
        ) {
            composable(AppRoute.Home.route) {
                HomeScreen(
                    isLoggedIn = authState.isLoggedIn,
                    isStaff = authState.user?.isStaff == true,
                    onNavigate = { navController.navigate(it) },
                    onLogin = { authViewModel.openNativeLogin() },
                    onDashboard = { navController.navigate(AppRoute.Dashboard.route) },
                    onAdmin = { navController.navigate(AppRoute.AdminHome.route) },
                )
            }
            composable(AppRoute.Info.route) { InfoScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.About.route) { AboutScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.Faq.route) { FaqScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.Contact.route) { ContactScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.Testimonials.route) { TestimonialsScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.Services.route) { ServiceMarketingScreen(onBack = { navController.popBackStack() }) }
            composable(AppRoute.Privacy.route) { LegalScreens(LegalKind.Privacy) { navController.popBackStack() } }
            composable(AppRoute.Terms.route) { LegalScreens(LegalKind.Terms) { navController.popBackStack() } }
            composable(AppRoute.Hipaa.route) { LegalScreens(LegalKind.Hipaa) { navController.popBackStack() } }
            composable(AppRoute.BlogList.route) {
                BlogListScreen(
                    onBack = { navController.popBackStack() },
                    onOpenPost = { slug -> navController.navigate(AppRoute.BlogDetail.create(slug)) },
                )
            }
            composable(
                route = AppRoute.BlogDetail.route,
                arguments = listOf(navArgument("slug") { type = NavType.StringType }),
            ) { entry ->
                BlogDetailScreen(
                    slug = entry.argString("slug"),
                    onBack = { navController.popBackStack() },
                )
            }

            composable(AppRoute.Login.route) {
                LoginScreen(
                    authViewModel = authViewModel,
                    onBack = { navController.popBackStack() },
                    onLoggedIn = {
                        val staff = authViewModel.uiState.value.user?.isStaff == true
                        navController.navigate(
                            if (staff) AppRoute.AdminHome.route else AppRoute.Dashboard.route,
                        ) {
                            popUpTo(AppRoute.Home.route)
                        }
                    },
                )
            }

            composable(AppRoute.Dashboard.route) {
                DashboardScreen(
                    authViewModel = authViewModel,
                    onNavigate = { navController.navigate(it) },
                    onBack = { navController.popBackStack() },
                    onLogout = {
                        authViewModel.logout()
                        navController.navigate(AppRoute.Home.route) {
                            popUpTo(AppRoute.Home.route) { inclusive = true }
                        }
                    },
                )
            }
            composable(AppRoute.ProfileWizard.route) { ProfileWizardScreen { navController.popBackStack() } }
            composable(AppRoute.ConsentForms.route) { ConsentFormsScreen { navController.popBackStack() } }
            composable(AppRoute.Schedule.route) { ScheduleScreen { navController.popBackStack() } }
            composable(AppRoute.WeightLogging.route) { WeightLoggingScreen { navController.popBackStack() } }
            composable(AppRoute.MedicationTracker.route) { MedicationTrackerScreen { navController.popBackStack() } }
            composable(AppRoute.MealTracker.route) {
                MealTrackerScreen(
                    onBack = { navController.popBackStack() },
                    onOpenBarcode = { navController.navigate(AppRoute.BarcodeScanner.route) },
                )
            }
            composable(AppRoute.SideEffects.route) { SideEffectsScreen { navController.popBackStack() } }
            composable(AppRoute.Membership.route) { MembershipScreen { navController.popBackStack() } }
            composable(AppRoute.BarcodeScanner.route) { BarcodeScannerScreen { navController.popBackStack() } }

            composable(AppRoute.AdminHome.route) {
                AdminHomeScreen(
                    onBack = { navController.popBackStack() },
                    onNavigate = { navController.navigate(it) },
                    onOpenChart = { id -> navController.navigate(AppRoute.PatientChart.create(id)) },
                )
            }
            composable(
                route = AppRoute.PatientChart.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                PatientChartScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                    onNavigate = { navController.navigate(it) },
                )
            }
            composable(
                route = AppRoute.AdminChartProfile.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminProfileSummaryScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartConsents.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminConsentFormsScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartSideEffects.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminPatientSideEffectsScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartWeight.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminWeightLoggingScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartMedications.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminMedicationScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartMeals.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminMealTrackerScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartQuestions.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminQuestionsScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = AppRoute.AdminChartReschedule.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                AdminPatientRescheduleScreen(
                    userId = entry.argString("userId"),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(AppRoute.RescheduleRequests.route) { RescheduleRequestsScreen { navController.popBackStack() } }
            composable(AppRoute.AdminSideEffects.route) { AdminSideEffectsScreen { navController.popBackStack() } }
            composable(AppRoute.AdminSettings.route) {
                AdminSettingsScreen(onBack = { navController.popBackStack() })
            }
            composable(AppRoute.LabRequisition.route) {
                LabRequisitionScreen(onBack = { navController.popBackStack() })
            }
            composable(
                route = AppRoute.LabRequisitionForUser.route,
                arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            ) { entry ->
                LabRequisitionScreen(
                    onBack = { navController.popBackStack() },
                    userId = entry.argString("userId"),
                )
            }
            composable(AppRoute.BlogCms.route) { BlogCmsScreen { navController.popBackStack() } }
        }
    }
}
