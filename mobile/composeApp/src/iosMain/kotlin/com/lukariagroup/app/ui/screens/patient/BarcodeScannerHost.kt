package com.lukariagroup.app.ui.screens.patient

/**
 * Swift installs [presenter] at app launch (see BarcodeScannerBridge.swift).
 * Uses an explicit completion type so the Swift/Kotlin bridge stays stable.
 */
interface BarcodeScannerCompletion {
    fun onComplete(barcode: String?)
}

interface BarcodeScannerPresenter {
    fun present(onComplete: BarcodeScannerCompletion)
}

object BarcodeScannerHost {
    var presenter: BarcodeScannerPresenter? = null
}
