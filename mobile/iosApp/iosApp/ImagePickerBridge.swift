import AVFoundation
import ComposeApp
import PhotosUI
import UIKit

/// Camera capture and photo-library picking for Kotlin screens (meal tracker, body scan gallery).
enum ImagePickerBridge {
    static func install() {
        ImagePickerHost.shared.presenter = Presenter()
    }

    private final class Presenter: NSObject, ImagePickerPresenter,
        UIImagePickerControllerDelegate, UINavigationControllerDelegate, PHPickerViewControllerDelegate {
        // Keep in sync with LookCameraBridge / Android JpegDataUrl.kt (Vercel ~4.5MB body limit).
        private static let maxSide: CGFloat = 2048
        private static let jpegQuality: CGFloat = 0.85

        private var completion: ImagePickerCompletion?

        func present(useCamera: Bool, completion: ImagePickerCompletion) {
            DispatchQueue.main.async {
                guard self.completion == nil, let root = Self.topViewController() else {
                    completion.onImagePicked(dataUrl: nil)
                    return
                }
                self.completion = completion
                if useCamera && UIImagePickerController.isSourceTypeAvailable(.camera) {
                    self.presentCamera(from: root)
                } else {
                    self.presentLibrary(from: root)
                }
            }
        }

        private func presentCamera(from root: UIViewController) {
            switch AVCaptureDevice.authorizationStatus(for: .video) {
            case .authorized:
                showCamera(from: root)
            case .notDetermined:
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    DispatchQueue.main.async {
                        if granted {
                            self.showCamera(from: root)
                        } else {
                            self.finish(nil)
                        }
                    }
                }
            default:
                showCameraDeniedAlert(from: root)
            }
        }

        private func showCamera(from root: UIViewController) {
            let picker = UIImagePickerController()
            picker.sourceType = .camera
            picker.cameraCaptureMode = .photo
            picker.delegate = self
            root.present(picker, animated: true)
        }

        private func showCameraDeniedAlert(from root: UIViewController) {
            let alert = UIAlertController(
                title: "Camera access is off",
                message: "Allow camera access for Svelte in Settings to take meal photos, or choose a photo from your library.",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "Open Settings", style: .default) { _ in
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
                self.finish(nil)
            })
            alert.addAction(UIAlertAction(title: "Choose Photo", style: .default) { _ in
                self.presentLibrary(from: root)
            })
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
                self.finish(nil)
            })
            root.present(alert, animated: true)
        }

        private func presentLibrary(from root: UIViewController) {
            var config = PHPickerConfiguration()
            config.filter = .images
            config.selectionLimit = 1
            let picker = PHPickerViewController(configuration: config)
            picker.delegate = self
            root.present(picker, animated: true)
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            let image = info[.originalImage] as? UIImage
            picker.dismiss(animated: true) { self.encodeAndFinish(image) }
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            picker.dismiss(animated: true) { self.finish(nil) }
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)
            guard let provider = results.first?.itemProvider, provider.canLoadObject(ofClass: UIImage.self) else {
                finish(nil)
                return
            }
            provider.loadObject(ofClass: UIImage.self) { object, _ in
                DispatchQueue.main.async { self.encodeAndFinish(object as? UIImage) }
            }
        }

        private func encodeAndFinish(_ image: UIImage?) {
            guard let image else {
                finish(nil)
                return
            }
            DispatchQueue.global(qos: .userInitiated).async {
                let scaled = Self.downscale(image, maxSide: Self.maxSide)
                let dataUrl = scaled.jpegData(compressionQuality: Self.jpegQuality)
                    .map { "data:image/jpeg;base64," + $0.base64EncodedString() }
                DispatchQueue.main.async { self.finish(dataUrl) }
            }
        }

        private func finish(_ dataUrl: String?) {
            let pending = completion
            completion = nil
            pending?.onImagePicked(dataUrl: dataUrl)
        }

        /// Redraws at scale 1, which also applies the photo's EXIF orientation.
        private static func downscale(_ image: UIImage, maxSide: CGFloat) -> UIImage {
            let size = image.size
            let longest = max(size.width, size.height)
            let ratio = longest > maxSide ? maxSide / longest : 1
            let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)
            let format = UIGraphicsImageRendererFormat.default()
            format.scale = 1
            return UIGraphicsImageRenderer(size: newSize, format: format).image { _ in
                image.draw(in: CGRect(origin: .zero, size: newSize))
            }
        }

        private static func topViewController(
            base: UIViewController? = UIApplication.shared.connectedScenes
                .compactMap { ($0 as? UIWindowScene)?.keyWindow }
                .first?
                .rootViewController
        ) -> UIViewController? {
            if let nav = base as? UINavigationController {
                return topViewController(base: nav.visibleViewController)
            }
            if let tab = base as? UITabBarController {
                return topViewController(base: tab.selectedViewController)
            }
            if let presented = base?.presentedViewController {
                return topViewController(base: presented)
            }
            return base
        }
    }
}
