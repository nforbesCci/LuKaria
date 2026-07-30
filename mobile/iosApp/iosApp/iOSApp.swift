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
                    NotificationCenter.default.post(
                        name: Notification.Name("LukariaAuthCallback"),
                        object: nil,
                        userInfo: ["url": url.absoluteString]
                    )
                }
        }
    }
}
