package com.lukariagroup.app.core

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * Invoked when any API call returns HTTP 401.
 * App collects [events] on the main coroutine and logs out + navigates Home.
 *
 * Note: avoid `@Volatile` — it is JVM-only and breaks iosArm64 compilation.
 */
object SessionExpiredHandler {
    private val _events = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val events: SharedFlow<Unit> = _events.asSharedFlow()

    private var fired: Boolean = false

    fun notifyUnauthorized() {
        if (fired) return
        fired = true
        _events.tryEmit(Unit)
    }

    /** Allow a subsequent 401 after the user has signed in again. */
    fun reset() {
        fired = false
    }
}
