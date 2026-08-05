import AVFoundation
import ComposeApp
import UIKit

/// Presents a simple AVFoundation barcode scanner for Kotlin meal / food lookup.
enum BarcodeScannerBridge {
    static func install() {
        BarcodeScannerHost.shared.presenter = Presenter()
    }

    private final class Presenter: BarcodeScannerPresenter {
        func present(onComplete: BarcodeScannerCompletion) {
            DispatchQueue.main.async {
                guard let root = Self.topViewController() else {
                    onComplete.onComplete(barcode: nil)
                    return
                }
                let scanner = ScannerViewController { value in
                    onComplete.onComplete(barcode: value)
                }
                scanner.modalPresentationStyle = .fullScreen
                root.present(scanner, animated: true)
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

private final class ScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    private let onResult: (String?) -> Void
    private let session = AVCaptureSession()
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var finished = false

    init(onResult: @escaping (String?) -> Void) {
        self.onResult = onResult
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        let cancel = UIButton(type: .system)
        cancel.setTitle("Cancel", for: .normal)
        cancel.setTitleColor(.white, for: .normal)
        cancel.titleLabel?.font = .boldSystemFont(ofSize: 17)
        cancel.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        cancel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(cancel)
        NSLayoutConstraint.activate([
            cancel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            cancel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
        ])

        let hint = UILabel()
        hint.text = "Point at a product barcode"
        hint.textColor = .white
        hint.textAlignment = .center
        hint.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hint)
        NSLayoutConstraint.activate([
            hint.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -24),
            hint.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            hint.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
        ])

        requestCameraAndStart()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    private func requestCameraAndStart() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            configureSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    if granted {
                        self?.configureSession()
                    } else {
                        self?.finish(nil)
                    }
                }
            }
        default:
            finish(nil)
        }
    }

    private func configureSession() {
        session.beginConfiguration()
        session.sessionPreset = .high

        guard
            let device = AVCaptureDevice.default(for: .video),
            let input = try? AVCaptureDeviceInput(device: device),
            session.canAddInput(input)
        else {
            finish(nil)
            return
        }
        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else {
            finish(nil)
            return
        }
        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
        let types: [AVMetadataObject.ObjectType] = [
            .ean13,
            .ean8,
            .upce,
            .code128,
            .code39,
            .qr,
        ]
        output.metadataObjectTypes = types.filter { output.availableMetadataObjectTypes.contains($0) }

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.videoGravity = .resizeAspectFill
        preview.frame = view.bounds
        view.layer.insertSublayer(preview, at: 0)
        previewLayer = preview

        session.commitConfiguration()
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }
    }

    func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard !finished else { return }
        guard
            let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
            let value = object.stringValue,
            !value.isEmpty
        else { return }
        finish(value)
    }

    @objc private func cancelTapped() {
        finish(nil)
    }

    private func finish(_ value: String?) {
        guard !finished else { return }
        finished = true
        if session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.session.stopRunning()
            }
        }
        dismiss(animated: true) { [onResult] in
            onResult(value)
        }
    }
}
