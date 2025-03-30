package com.lora_connect.application.obstacles

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.ToastHelper

class ObstacleListActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val toastHelper = ToastHelper(this)
        val viewModel = ObstacleListViewModel(application, toastHelper) {
            finish()
        }

        setContent {
            ApplicationTheme {
                ObstacleListScreen(viewModel)
            }
        }

        enableEdgeToEdge()
    }
}