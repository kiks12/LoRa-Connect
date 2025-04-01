package com.lora_connect.application.map

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import compose.icons.FeatherIcons
import compose.icons.feathericons.Bluetooth

@Composable
fun BluetoothButton() {
    var showText by remember { mutableStateOf(true) }
    var resetTimer by remember { mutableStateOf(false) }

    // Timer to switch to the Bluetooth icon after 5 seconds
    LaunchedEffect(resetTimer) {
        if (showText) {
            delay(5000) // Wait for 5 seconds
            showText = false
        }
    }

    AnimatedContent(
        targetState = showText,
        transitionSpec = {
            (fadeIn(animationSpec = tween(300)) + scaleIn(initialScale = 0.8f) togetherWith
                    fadeOut(animationSpec = tween(200)) + scaleOut(targetScale = 0.8f))
        }, label = ""
    ) { state ->
        if (state) {
            // Normal Button with text
            Button(
                onClick = {
                    showText = false
                    resetTimer = !resetTimer // Restart timer
                },
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text(text = "Bluetooth Device", fontSize = 12.sp)
            }
        } else {
            // IconButton when only the icon is visible
            IconButton(
                onClick = {
                    showText = true
                    resetTimer = !resetTimer // Restart timer
                }
            ) {
                Icon(FeatherIcons.Bluetooth, contentDescription = "Bluetooth Icon")
            }
        }
    }
}

