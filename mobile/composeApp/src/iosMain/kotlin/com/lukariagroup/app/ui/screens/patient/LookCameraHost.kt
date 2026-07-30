package com.lukariagroup.app.ui.screens.patient

/**
 * Swift registers a [LookCameraPresenter] at app start so Compose can launch
 * the LookCamera SDK ([https://github.com/3dlook-me/ios_sdk_public](https://github.com/3dlook-me/ios_sdk_public)).
 *
 * Uses an explicit [LookCameraCompletion] type instead of a Kotlin function type so
 * Swift can conform to the exported protocol (K/N does not map lambdas cleanly).
 */
interface LookCameraCompletion {
    fun onComplete(frontDataUrl: String?, sideDataUrl: String?)
}

interface LookCameraPresenter {
    fun present(onComplete: LookCameraCompletion)
}

object LookCameraHost {
    var presenter: LookCameraPresenter? = null
}
