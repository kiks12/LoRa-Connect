package com.lora_connect.application.tasks.list

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import com.lora_connect.application.ui.theme.ApplicationTheme

class TaskListActivity : ComponentActivity() {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val taskListViewModel = TaskListViewModel(application) {
            finish()
        }

        setContent {
            ApplicationTheme {
                TaskListScreen(viewModel = taskListViewModel)
            }
        }

        enableEdgeToEdge()
    }
}