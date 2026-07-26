package com.lukariagroup.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lukariagroup.app.core.SessionUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class AuthUiState(
    val user: SessionUser? = null,
    val isLoggedIn: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val pastedToken: String = "",
)

class AuthViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        authRepository.restoreSession()
        viewModelScope.launch {
            authRepository.user.collect { user ->
                _uiState.value = _uiState.value.copy(
                    user = user,
                    isLoggedIn = user != null || authRepository.isLoggedIn,
                    isLoading = false,
                )
            }
        }
    }

    fun onTokenChanged(value: String) {
        _uiState.value = _uiState.value.copy(pastedToken = value, error = null)
    }

    fun loginWithPastedToken() {
        val token = _uiState.value.pastedToken
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                authRepository.loginWithAccessToken(token)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    pastedToken = "",
                    isLoggedIn = true,
                    user = authRepository.currentUser(),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Login failed",
                )
            }
        }
    }

    fun openNativeLogin() {
        openAuth0Login()
    }

    fun logout() {
        authRepository.logout()
        _uiState.value = AuthUiState()
    }
}
