package com.lora_connect.application

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.lora_connect.application.components.OfflineMap
import com.lora_connect.application.ui.theme.ApplicationTheme
import org.maplibre.android.MapLibre

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)

        setContent {
            ApplicationTheme {
                OfflineMap(modifier = Modifier.fillMaxSize())
            }
        }
    }
}