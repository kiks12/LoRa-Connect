package com.lora_connect.application.authentication

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import compose.icons.FeatherIcons
import compose.icons.feathericons.Bluetooth

@Composable
fun ScanningAnimation() {
    val infiniteTransition = rememberInfiniteTransition(label = "")

    // Animate scale (expanding and contracting effect)
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 2.5f, // Expands outward
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = ""
    )

    // Animate alpha (fading effect as it expands)
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f, // Fades out
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = ""
    )

    val color = Color(50, 122, 237)

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        // Outer Pulsating Circle
        Box(
            modifier = Modifier
                .size(200.dp)
                .scale(scale)
                .background(color.copy(alpha = alpha), shape = CircleShape)
        )

        // Static Center Circle (representing the scanning icon)
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(color, shape = CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(FeatherIcons.Bluetooth, contentDescription = "Bluetooth", tint = Color.White)
        }
    }
}
