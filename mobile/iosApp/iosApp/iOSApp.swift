import SwiftUI

@main
struct iOSApp: App {
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
