import java.io.FileInputStream
import java.util.Properties

rootProject.name = "Lukaria"
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

val githubProperties = Properties().apply {
    val propsFile = File(rootDir, "github.properties")
    if (propsFile.exists()) {
        load(FileInputStream(propsFile))
    }
}

pluginManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/3dlook-me/android_sdk_public")
            credentials {
                username = githubProperties["gpr.usr"] as String?
                    ?: System.getenv("GPR_USER")
                    ?: ""
                password = githubProperties["gpr.key"] as String?
                    ?: System.getenv("GPR_API_KEY")
                    ?: ""
            }
        }
    }
}

include(":composeApp")
