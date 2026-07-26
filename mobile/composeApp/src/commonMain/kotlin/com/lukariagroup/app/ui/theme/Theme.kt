package com.lukariagroup.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val LukariaGold = Color(0xFF877449)
val LukariaGoldLight = Color(0xFFB39B6E)
val LukariaGoldDark = Color(0xFF5C4E31)
val LukariaCream = Color(0xFFF7F4EE)
val LukariaInk = Color(0xFF1C1915)
val LukariaMuted = Color(0xFF6B645A)
val LukariaSurface = Color(0xFFFFFBF6)
val LukariaError = Color(0xFFB3261E)

private val LightColors = lightColorScheme(
    primary = LukariaGold,
    onPrimary = Color.White,
    primaryContainer = LukariaGoldLight.copy(alpha = 0.35f),
    onPrimaryContainer = LukariaGoldDark,
    secondary = LukariaGoldDark,
    onSecondary = Color.White,
    background = LukariaCream,
    onBackground = LukariaInk,
    surface = LukariaSurface,
    onSurface = LukariaInk,
    surfaceVariant = Color(0xFFEDE6DA),
    onSurfaceVariant = LukariaMuted,
    error = LukariaError,
    outline = Color(0xFFC9C0B2),
)

private val DarkColors = darkColorScheme(
    primary = LukariaGoldLight,
    onPrimary = LukariaInk,
    primaryContainer = LukariaGoldDark,
    onPrimaryContainer = LukariaCream,
    secondary = LukariaGold,
    onSecondary = Color.White,
    background = Color(0xFF14110E),
    onBackground = LukariaCream,
    surface = Color(0xFF1E1A16),
    onSurface = LukariaCream,
    surfaceVariant = Color(0xFF2A241E),
    onSurfaceVariant = Color(0xFFC9C0B2),
    error = Color(0xFFFFB4AB),
    outline = Color(0xFF8A8074),
)

@Composable
fun LukariaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
