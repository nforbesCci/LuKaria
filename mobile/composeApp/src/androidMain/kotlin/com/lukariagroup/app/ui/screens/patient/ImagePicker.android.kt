package com.lukariagroup.app.ui.screens.patient

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File

@Composable
actual fun rememberImageDataUrlSources(onResult: (String?) -> Unit): ImageSourceLaunchers {
    val context = LocalContext.current
    var captureUri by remember { mutableStateOf<Uri?>(null) }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent(),
    ) { uri ->
        if (uri == null) {
            onResult(null)
            return@rememberLauncherForActivityResult
        }
        onResult(uriToJpegDataUrl(context, uri))
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture(),
    ) { success ->
        val uri = captureUri
        captureUri = null
        if (!success || uri == null) {
            onResult(null)
            return@rememberLauncherForActivityResult
        }
        onResult(uriToJpegDataUrl(context, uri))
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (!granted) {
            onResult(null)
            return@rememberLauncherForActivityResult
        }
        val uri = createCaptureUri(context) ?: run {
            onResult(null)
            return@rememberLauncherForActivityResult
        }
        captureUri = uri
        cameraLauncher.launch(uri)
    }

    val takePhoto = remember(cameraLauncher, permissionLauncher) {
        {
            val hasCamera = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA,
            ) == PackageManager.PERMISSION_GRANTED
            if (!hasCamera) {
                permissionLauncher.launch(Manifest.permission.CAMERA)
            } else {
                val uri = createCaptureUri(context)
                if (uri == null) {
                    onResult(null)
                } else {
                    captureUri = uri
                    cameraLauncher.launch(uri)
                }
            }
        }
    }

    val pickGallery = remember(galleryLauncher) {
        { galleryLauncher.launch("image/*") }
    }

    return remember(takePhoto, pickGallery) {
        ImageSourceLaunchers(takePhoto = takePhoto, pickGallery = pickGallery)
    }
}

private fun createCaptureUri(context: android.content.Context): Uri? =
    runCatching {
        val file = File.createTempFile(
            "meal_capture_",
            ".jpg",
            context.cacheDir,
        )
        FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file,
        )
    }.getOrNull()
