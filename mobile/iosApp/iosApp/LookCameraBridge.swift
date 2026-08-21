import Foundation
import UIKit
import LookCamera
import ComposeApp

/// Bridges the 3DLOOK LookCamera SDK into Kotlin Compose.
/// @see https://github.com/3dlook-me/ios_sdk_public
enum LookCameraBridge {
    static func install() {
        LookCameraHost.shared.presenter = Presenter()
    }

    private final class Presenter: LookCameraPresenter {
        // K/N exports the parameter as onComplete_ for Swift protocol conformance.
        func present(onComplete_ onComplete: LookCameraCompletion) {
            DispatchQueue.main.async {
                LookCameraSDK.shared.presentSDKView(mode: .startFromTutorial) { result in
                    let front = Self.jpegDataUrl(from: result.frontPhoto)
                    let side = Self.jpegDataUrl(from: result.sidePhoto)
                    onComplete.onComplete(frontDataUrl: front, sideDataUrl: side)
                }
            }
        }

        private static func jpegDataUrl(from url: URL?) -> String? {
            guard let url else { return nil }
            guard let data = try? Data(contentsOf: url) else { return nil }
            // Re-encode as JPEG so FitXpress always receives a compact data URL.
            if let image = UIImage(data: data),
               let jpeg = image.jpegData(compressionQuality: 0.92) {
                return "data:image/jpeg;base64," + jpeg.base64EncodedString()
            }
            return "data:image/jpeg;base64," + data.base64EncodedString()
        }
    }
}
