package com.lukariagroup.app.ui.screens.patient

/**
 * Swift registers a [LookCameraPresenter] at app start so Compose can launch
 * the LookCamera SDK ([https://github.com/3dlook-me/ios_sdk_public](https://github.com/3dlook-me/ios_sdk_public)).
 */
fun interface LookCameraPresenter {
    /**
     * Present the AI camera UI. [onComplete] receives JPEG data URLs
     * (`data:image/jpeg;base64,...`) or nulls if cancelled / unavailable.
     */
    fun present(onComplete: (frontDataUrl: String?, sideDataUrl: String?) -> Unit)
}

object LookCameraHost {
    var presenter: LookCameraPresenter? = null
}
