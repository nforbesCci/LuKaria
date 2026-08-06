import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }

    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64(),
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "ComposeApp"
            isStatic = true
        }
    }

    sourceSets {
        androidMain.dependencies {
            implementation(libs.androidx.activity.compose)
            implementation(libs.ktor.client.cio)
            // 3DLOOK FitXpress AI camera capture UI
            // https://github.com/3dlook-me/android_sdk_public
            // Patched AAR: privacy checkbox pre-accepted (see scripts/patch-look-camera-android.py)
            implementation(files("libs/look-camera-sdk-0.0.3-lukaria.aar"))
            // LookCamera transitive deps (file AAR does not pull POM deps)
            implementation("androidx.camera:camera-core:1.4.2")
            implementation("androidx.camera:camera-camera2:1.4.2")
            implementation("androidx.camera:camera-lifecycle:1.4.2")
            implementation("androidx.camera:camera-view:1.4.2")
            implementation("androidx.camera:camera-extensions:1.4.2")
            implementation("androidx.camera:camera-video:1.4.2")
            implementation("androidx.graphics:graphics-path:1.1.0")
            // Google Code Scanner (Play Services) for food barcodes
            implementation("com.google.android.gms:play-services-code-scanner:16.1.0")
        }
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.materialIconsExtended)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(libs.androidx.lifecycle.viewmodel)
            implementation(libs.androidx.lifecycle.viewmodel.compose)
            implementation(libs.androidx.lifecycle.runtime.compose)
            implementation(libs.androidx.navigation.compose)

            implementation(libs.ktor.client.core)
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.client.logging)
            implementation(libs.ktor.client.auth)
            implementation(libs.ktor.serialization.json)

            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
        iosMain.dependencies {
            // Darwin (NSURLSession) — CIO has no TLS on Kotlin/Native
            implementation(libs.ktor.client.darwin)
        }
    }
}

android {
    namespace = "com.lukariagroup.app"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.lukariagroup.app"
        minSdk = libs.versions.android.minSdk.get().toInt()
        targetSdk = libs.versions.android.targetSdk.get().toInt()
        // CI: -PVERSION_CODE=${{ github.run_number }} -PVERSION_NAME=1.0.0
        versionCode = (project.findProperty("VERSION_CODE") as? String)?.toIntOrNull() ?: 1
        versionName = (project.findProperty("VERSION_NAME") as? String)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: "1.0.0"
        // Production by default. Local Next.js override:
        //   ./gradlew :composeApp:installDebug -PAPI_BASE_URL=https://127.0.0.1:3000
        // then: adb reverse tcp:3000 tcp:3000
        val apiBaseUrl = (project.findProperty("API_BASE_URL") as? String)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: "https://www.lukariagroup.com"
        buildConfigField("String", "API_BASE_URL", "\"$apiBaseUrl\"")
    }
    buildFeatures {
        buildConfig = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
        jniLibs {
            useLegacyPackaging = false
        }
    }

    configurations.configureEach {
        resolutionStrategy {
            force(
                "androidx.camera:camera-core:1.4.2",
                "androidx.camera:camera-camera2:1.4.2",
                "androidx.camera:camera-lifecycle:1.4.2",
                "androidx.camera:camera-view:1.4.2",
                "androidx.camera:camera-extensions:1.4.2",
                "androidx.camera:camera-video:1.4.2",
                "androidx.graphics:graphics-path:1.1.0",
            )
        }
    }

    val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")?.trim().orEmpty()
    val keystorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD").orEmpty()
    val keyAliasEnv = System.getenv("ANDROID_KEY_ALIAS").orEmpty()
    val keyPassword = System.getenv("ANDROID_KEY_PASSWORD").orEmpty()
    val releaseKeystore = keystorePath.takeIf { it.isNotEmpty() }?.let { file(it) }
    val hasReleaseSigning =
        releaseKeystore != null &&
            releaseKeystore.isFile &&
            keystorePassword.isNotEmpty() &&
            keyAliasEnv.isNotEmpty() &&
            keyPassword.isNotEmpty()

    signingConfigs {
        create("release") {
            if (hasReleaseSigning) {
                storeFile = releaseKeystore
                storePassword = keystorePassword
                keyAlias = keyAliasEnv
                this.keyPassword = keyPassword
            }
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
    // KMP + LookCamera AAR: lintVital can crash the AGP lint worker on release.
    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}
