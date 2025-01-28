package com.lora_connect.application.tasks.completion

import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.lora_connect.application.tasks.TASK_SERIALIZABLE_TAG
import com.lora_connect.application.tasks.Task
import com.lora_connect.application.ui.theme.ApplicationTheme

class TaskCompletionActivity : AppCompatActivity() {
    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val task = intent.getSerializableExtra(TASK_SERIALIZABLE_TAG, Task::class.java)

        val taskCompletionViewModel = TaskCompletionViewModel(task)

        setContent {
            ApplicationTheme {
                TaskCompletionScreen(viewModel = taskCompletionViewModel)
            }
        }

        enableEdgeToEdge()
    }
}