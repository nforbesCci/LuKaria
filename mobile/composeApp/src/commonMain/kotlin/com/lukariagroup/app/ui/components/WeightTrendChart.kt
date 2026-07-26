package com.lukariagroup.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlin.math.max

data class WeightChartPoint(
    val label: String,
    val weight: Double,
)

/**
 * Weight trend line chart — chronological left → right.
 */
@Composable
fun WeightTrendChart(
    points: List<WeightChartPoint>,
    modifier: Modifier = Modifier,
    lineColor: Color = MaterialTheme.colorScheme.primary,
) {
    if (points.size < 2) {
        Text(
            text = if (points.isEmpty()) {
                "Log at least two weigh-ins to see your trend."
            } else {
                "One measurement so far — add another date to graph change."
            },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = modifier.fillMaxWidth().padding(vertical = 8.dp),
        )
        return
    }

    val weights = points.map { it.weight }
    val minW = weights.minOrNull() ?: 0.0
    val maxW = weights.maxOrNull() ?: 1.0
    val span = max(maxW - minW, 1.0)
    val pad = span * 0.12
    val yMin = minW - pad
    val yMax = maxW + pad
    val yRange = max(yMax - yMin, 1.0)

    val first = points.first().weight
    val last = points.last().weight
    val delta = last - first
    val deltaLabel = when {
        delta > 0.05 -> "+${formatOne(delta)} lbs"
        delta < -0.05 -> "${formatOne(delta)} lbs"
        else -> "No change"
    }
    val deltaColor = when {
        delta < -0.05 -> Color(0xFF2E7D32)
        delta > 0.05 -> Color(0xFFC62828)
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    val yTop = formatOne(yMax)
    val yMid = formatOne((yMin + yMax) / 2.0)
    val yBottom = formatOne(yMin)

    val gridColor = MaterialTheme.colorScheme.outlineVariant

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "${formatOne(first)} → ${formatOne(last)} lbs",
                style = MaterialTheme.typography.titleSmall,
            )
            Text(deltaLabel, style = MaterialTheme.typography.titleSmall, color = deltaColor)
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .background(
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                    RoundedCornerShape(12.dp),
                )
                .padding(8.dp),
        ) {
            Column(
                modifier = Modifier
                    .width(40.dp)
                    .fillMaxHeight()
                    .padding(end = 4.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End,
            ) {
                Text(yTop, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(yMid, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(yBottom, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Box(modifier = Modifier.weight(1f).fillMaxHeight()) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val chartW = size.width
                    val chartH = size.height
                    if (chartW <= 0f || chartH <= 0f) return@Canvas

                    fun xAt(i: Int): Float =
                        if (points.size == 1) chartW / 2f else chartW * i / (points.size - 1).toFloat()

                    fun yAt(w: Double): Float =
                        chartH * (1f - ((w - yMin) / yRange).toFloat())

                    for (s in 0..4) {
                        val t = s / 4f
                        val y = chartH * (1f - t)
                        drawLine(
                            color = gridColor,
                            start = Offset(0f, y),
                            end = Offset(chartW, y),
                            strokeWidth = 1.dp.toPx(),
                        )
                    }

                    val path = Path()
                    points.forEachIndexed { i, p ->
                        val x = xAt(i)
                        val y = yAt(p.weight)
                        if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
                    }
                    drawPath(
                        path = path,
                        color = lineColor,
                        style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round),
                    )
                    points.forEachIndexed { i, p ->
                        val center = Offset(xAt(i), yAt(p.weight))
                        drawCircle(color = lineColor, radius = 5.dp.toPx(), center = center)
                        drawCircle(color = Color.White, radius = 2.5.dp.toPx(), center = center)
                    }
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(start = 48.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(shortDate(points.first().label), style = MaterialTheme.typography.labelSmall)
            if (points.size > 2) {
                Text(shortDate(points[points.size / 2].label), style = MaterialTheme.typography.labelSmall)
            }
            Text(shortDate(points.last().label), style = MaterialTheme.typography.labelSmall)
        }

        Text(
            text = "${points.size} weigh-ins · ${points.first().label} to ${points.last().label}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

private fun formatOne(v: Double): String {
    val rounded = kotlin.math.round(v * 10.0) / 10.0
    return if (rounded == rounded.toLong().toDouble()) rounded.toLong().toString() else rounded.toString()
}

private fun shortDate(iso: String): String {
    val parts = iso.split("-")
    return if (parts.size >= 3) "${parts[1]}/${parts[2]}" else iso.takeLast(5)
}
