package com.lukariagroup.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

data class StrokePoint(val x: Float, val y: Float)
data class SignatureStroke(val points: List<StrokePoint>)

/**
 * Compose Canvas signature pad. Strokes are stored as path points in common code;
 * PNG data-URL export is platform-specific via [encodeSignatureToPngDataUrl].
 *
 * @param autoCommit when true, exports a PNG after each stroke ends (no "Use signature" tap).
 */
@Composable
fun SignaturePad(
    modifier: Modifier = Modifier,
    strokeColor: Color = MaterialTheme.colorScheme.onSurface,
    autoCommit: Boolean = false,
    onSigned: (dataUrl: String) -> Unit,
    onCleared: (() -> Unit)? = null,
) {
    val strokes = remember { mutableStateListOf<SignatureStroke>() }
    var currentPoints by remember { mutableStateOf<List<StrokePoint>>(emptyList()) }
    var canvasSize by remember { mutableStateOf(IntSize.Zero) }
    val scope = rememberCoroutineScope()
    var exporting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var committed by remember { mutableStateOf(false) }

    fun exportNow() {
        if (canvasSize.width <= 0 || canvasSize.height <= 0) return
        val all = strokes.toList() +
            if (currentPoints.isNotEmpty()) listOf(SignatureStroke(currentPoints)) else emptyList()
        if (all.isEmpty()) return
        scope.launch {
            exporting = true
            error = null
            try {
                val dataUrl = encodeSignatureToPngDataUrl(
                    strokes = all,
                    width = canvasSize.width,
                    height = canvasSize.height,
                )
                onSigned(dataUrl)
                committed = true
            } catch (e: Exception) {
                error = e.message ?: "Could not export signature"
            } finally {
                exporting = false
            }
        }
    }

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Sign below", style = MaterialTheme.typography.titleSmall)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                .onSizeChanged { canvasSize = it }
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            currentPoints = listOf(StrokePoint(offset.x, offset.y))
                        },
                        onDragEnd = {
                            if (currentPoints.isNotEmpty()) {
                                strokes.add(SignatureStroke(currentPoints))
                                currentPoints = emptyList()
                                if (autoCommit) exportNow()
                            }
                        },
                        onDragCancel = { currentPoints = emptyList() },
                        onDrag = { change, _ ->
                            change.consume()
                            currentPoints = currentPoints + StrokePoint(change.position.x, change.position.y)
                        },
                    )
                },
        ) {
            Canvas(modifier = Modifier.matchParentSize()) {
                fun drawStroke(points: List<StrokePoint>) {
                    if (points.isEmpty()) return
                    val path = Path().apply {
                        moveTo(points.first().x, points.first().y)
                        points.drop(1).forEach { lineTo(it.x, it.y) }
                    }
                    drawPath(
                        path = path,
                        color = strokeColor,
                        style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
                    )
                }
                strokes.forEach { drawStroke(it.points) }
                drawStroke(currentPoints)
            }
        }

        error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }
        if (committed && autoCommit) {
            Text("Signature ready", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedButton(
                onClick = {
                    strokes.clear()
                    currentPoints = emptyList()
                    error = null
                    committed = false
                    onCleared?.invoke()
                },
                modifier = Modifier.weight(1f),
            ) {
                Text("Clear")
            }
            if (!autoCommit) {
                Button(
                    enabled = !exporting && (strokes.isNotEmpty() || currentPoints.isNotEmpty()),
                    onClick = { exportNow() },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(if (exporting) "Saving…" else "Use signature")
                }
            }
        }
    }
}

expect suspend fun encodeSignatureToPngDataUrl(
    strokes: List<SignatureStroke>,
    width: Int,
    height: Int,
): String
