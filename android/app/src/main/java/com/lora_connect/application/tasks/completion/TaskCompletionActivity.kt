package com.lora_connect.application.tasks.completion

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import com.lora_connect.application.tasks.current_task.CurrentTask
import com.lora_connect.application.ui.theme.ApplicationTheme

class TaskCompletionActivity : ComponentActivity() {
    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val currentTask = CurrentTask.instance.getTask().value

        if (currentTask != null) {
            val taskCompletionViewModel = TaskCompletionViewModel(currentTask) {
                finish()
            }

            setContent {
                ApplicationTheme {
                    TaskCompletionScreen(viewModel = taskCompletionViewModel)
                }
            }
        } else {
            setContent {
                ApplicationTheme {
                    Scaffold { innerPadding ->
                        Column(
                            modifier = Modifier.padding(innerPadding)
                        ) {
                            Text(text = "Current Task is Null")
                            Button(onClick = { finish() }) {
                                Text(text = "Go Back")
                            }
                        }
                    }
                }
            }
        }

        enableEdgeToEdge()
    }
}