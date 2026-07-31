import SwiftUI
import ComposeApp

@main
struct iOSApp: App {
    init() {
        // Wire 3DLOOK LookCamera SDK for Kotlin Body Scan screen.
        LookCameraBridge.install()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    // Auth0 returns tokens in the URL fragment for native login.
                    // Must call Kotlin — posting a Notification alone was never observed.
                    _ = AuthCallbackKt.handleAuth0CallbackUrl(url: url.absoluteString)
                }
        }
    }
}
