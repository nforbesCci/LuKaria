import SwiftUI
import UIKit
import UserNotifications
import ComposeApp

final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        // Ask early so booking reminders can appear in Notification Center.
        center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
        return true
    }

    // Show booking reminders as banners even while the app is open.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .list, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
}

@main
struct iOSApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    init() {
        // Wire 3DLOOK LookCamera SDK for Kotlin Body Scan screen.
        LookCameraBridge.install()
        // AVFoundation barcode scanner for meal / food lookup.
        BarcodeScannerBridge.install()
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
