package com.lukariagroup.app.ui.navigation

sealed class AppRoute(val route: String) {
    data object Home : AppRoute("home")
    data object Info : AppRoute("info")
    data object About : AppRoute("about")
    data object Faq : AppRoute("faq")
    data object Contact : AppRoute("contact")
    data object Testimonials : AppRoute("testimonials")
    data object Privacy : AppRoute("privacy")
    data object Terms : AppRoute("terms")
    data object Hipaa : AppRoute("hipaa")
    data object Services : AppRoute("services")
    data object BlogList : AppRoute("blog")
    data object BlogDetail : AppRoute("blog/{slug}") {
        fun create(slug: String) = "blog/$slug"
    }

    data object Login : AppRoute("login")

    data object Dashboard : AppRoute("patient/dashboard")
    data object ProfileWizard : AppRoute("patient/profile")
    data object ConsentForms : AppRoute("patient/consents")
    data object Schedule : AppRoute("patient/schedule")
    data object WeightLogging : AppRoute("patient/weight")
    data object MedicationTracker : AppRoute("patient/medications")
    data object MealTracker : AppRoute("patient/meals")
    data object SideEffects : AppRoute("patient/side-effects")
    data object Membership : AppRoute("patient/membership")
    data object BarcodeScanner : AppRoute("patient/barcode")

    data object AdminHome : AppRoute("admin/home")
    data object PatientChart : AppRoute("admin/chart/{userId}") {
        fun create(userId: String) = "admin/chart/$userId"
    }
    data object AdminChartProfile : AppRoute("admin/chart/{userId}/profile") {
        fun create(userId: String) = "admin/chart/$userId/profile"
    }
    data object AdminChartConsents : AppRoute("admin/chart/{userId}/consents") {
        fun create(userId: String) = "admin/chart/$userId/consents"
    }
    data object AdminChartSideEffects : AppRoute("admin/chart/{userId}/side-effects") {
        fun create(userId: String) = "admin/chart/$userId/side-effects"
    }
    data object AdminChartWeight : AppRoute("admin/chart/{userId}/weight") {
        fun create(userId: String) = "admin/chart/$userId/weight"
    }
    data object AdminChartMedications : AppRoute("admin/chart/{userId}/medications") {
        fun create(userId: String) = "admin/chart/$userId/medications"
    }
    data object AdminChartMeals : AppRoute("admin/chart/{userId}/meals") {
        fun create(userId: String) = "admin/chart/$userId/meals"
    }
    data object AdminChartQuestions : AppRoute("admin/chart/{userId}/questions") {
        fun create(userId: String) = "admin/chart/$userId/questions"
    }
    data object AdminChartReschedule : AppRoute("admin/chart/{userId}/reschedule") {
        fun create(userId: String) = "admin/chart/$userId/reschedule"
    }
    data object RescheduleRequests : AppRoute("admin/reschedule")
    data object AdminSideEffects : AppRoute("admin/side-effects")
    data object LabRequisition : AppRoute("admin/labs")
    data object LabRequisitionForUser : AppRoute("admin/labs/{userId}") {
        fun create(userId: String) = "admin/labs/$userId"
    }
    data object AdminSettings : AppRoute("admin/settings")
    data object BlogCms : AppRoute("admin/blog-cms")

    companion object {
        val marketing = listOf(
            Home, Info, About, Faq, Contact, Testimonials,
            Privacy, Terms, Hipaa, Services, BlogList,
        )
        val patient = listOf(
            Dashboard, ProfileWizard, ConsentForms, Schedule,
            WeightLogging, MedicationTracker, MealTracker,
            SideEffects, Membership, BarcodeScanner,
        )
        val admin = listOf(
            AdminHome, RescheduleRequests, AdminSideEffects, LabRequisition, AdminSettings, BlogCms,
        )
    }
}
