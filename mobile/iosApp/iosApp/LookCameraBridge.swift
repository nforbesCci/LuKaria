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
        // Keep in sync with Android JpegDataUrl.kt — two base64 photos must stay
        // under Vercel's ~4.5MB request body limit for /api/body-scan/create.
        private static let maxSide: CGFloat = 2048
        private static let jpegQuality: CGFloat = 0.92

        // K/N exports the parameter as onComplete_ for Swift protocol conformance.
        func present(onComplete_ onComplete: LookCameraCompletion) {
            DispatchQueue.main.async {
                LookCameraSDK.shared.presentSDKView(mode: .startFromTutorial) { result in
                    // Encode/downscale off the main thread — large JPEGs on main can
                    // freeze or contribute to post-capture instability.
                    DispatchQueue.global(qos: .userInitiated).async {
                        let front = Self.jpegDataUrl(from: result.frontPhoto)
                        let side = Self.jpegDataUrl(from: result.sidePhoto)
                        DispatchQueue.main.async {
                            onComplete.onComplete(frontDataUrl: front, sideDataUrl: side)
                        }
                    }
                }
            }
        }

        private static func jpegDataUrl(from url: URL?) -> String? {
            guard let url else { return nil }
            guard let data = try? Data(contentsOf: url) else { return nil }
            guard let image = UIImage(data: data) else {
                return "data:image/jpeg;base64," + data.base64EncodedString()
            }
            let scaled = downscale(image, maxSide: maxSide)
            guard let jpeg = scaled.jpegData(compressionQuality: jpegQuality) else {
                return "data:image/jpeg;base64," + data.base64EncodedString()
            }
            return "data:image/jpeg;base64," + jpeg.base64EncodedString()
        }

        private static func downscale(_ image: UIImage, maxSide: CGFloat) -> UIImage {
            let size = image.size
            let longest = max(size.width, size.height)
            guard longest > maxSide, longest > 0 else { return image }
            let ratio = maxSide / longest
            let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)
            let format = UIGraphicsImageRendererFormat.default()
            format.scale = 1
            let renderer = UIGraphicsImageRenderer(size: newSize, format: format)
            return renderer.image { _ in
                image.draw(in: CGRect(origin: .zero, size: newSize))
            }
        }
    }
}
