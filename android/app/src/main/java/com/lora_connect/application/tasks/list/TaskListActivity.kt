package com.lora_connect.application.tasks.list

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.lora_connect.application.ui.theme.ApplicationTheme

class TaskListActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // GET TASK LISTS FROM DB???
        val taskListViewModel = TaskListViewModel(listOf())

        setContent {
            ApplicationTheme {
                TaskListScreen(viewModel = taskListViewModel)
            }
        }

        enableEdgeToEdge()
    }
}