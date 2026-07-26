package com.lukariagroup.app.core

import com.lukariagroup.app.BuildConfig
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.cio.CIO
import java.security.cert.X509Certificate
import javax.net.ssl.X509TrustManager

actual fun createPlatformHttpClient(block: HttpClientConfig<*>.() -> Unit): HttpClient {
    return if (BuildConfig.DEBUG) {
        HttpClient(CIO) {
            engine {
                https {
                    // Local Next.js uses certificates/localhost.pem (self-signed).
                    trustManager = object : X509TrustManager {
                        override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) = Unit
                        override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) = Unit
                        override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
                    }
                }
            }
            block()
        }
    } else {
        HttpClient(CIO, block)
    }
}
