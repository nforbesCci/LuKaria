package com.lukariagroup.app.ui.screens.patient

/**
 * Swift installs [presenter] at app launch (see ImagePickerBridge.swift).
 * [ImagePickerCompletion.onImagePicked] receives a `data:image/jpeg;base64,...` string, or null if cancelled.
 */
interface ImagePickerCompletion {
    fun onImagePicked(dataUrl: String?)
}

interface ImagePickerPresenter {
    fun present(useCamera: Boolean, completion: ImagePickerCompletion)
}

object ImagePickerHost {
    var presenter: ImagePickerPresenter? = null
}
