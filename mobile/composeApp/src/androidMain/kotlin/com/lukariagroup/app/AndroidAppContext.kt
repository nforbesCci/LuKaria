package com.lukariagroup.app

import android.content.Context

/**
 * Holds the application [Context] for expect/actual implementations that need prefs / intents.
 * Set from [MainActivity] / Application onCreate.
 */
object AndroidAppContext {
    @Volatile
    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun require(): Context =
        appContext ?: error("AndroidAppContext not initialized. Call AndroidAppContext.init() in MainActivity.")

    fun getOrNull(): Context? = appContext
}
