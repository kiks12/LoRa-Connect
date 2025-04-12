package com.lora_connect.application.tasks.completion

import android.os.Build
import android.os.Bundle
import android.util.Log
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
import androidx.lifecycle.lifecycleScope
import com.lora_connect.application.shared.SharedBluetoothViewModel
import com.lora_connect.application.tasks.current_task.CurrentTask
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.createTaskStatusUpdatePacket
import kotlinx.coroutines.launch

class TaskCompletionActivity : ComponentActivity() {
    private lateinit var sharedBluetoothViewModel: SharedBluetoothViewModel
    private lateinit var taskCompletionViewModel: TaskCompletionViewModel

    companion object {
        private const val TAG = "TaskCompletionActivity"
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sharedBluetoothViewModel = SharedBluetoothViewModel(application)
        val currentTask = CurrentTask.instance.getTask().value

        if (currentTask != null) {
            taskCompletionViewModel = TaskCompletionViewModel(this@TaskCompletionActivity.application, currentTask) {
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

        taskCompletionViewModel.statusUpdateTriggerLiveData.observe(this) {
            val service = sharedBluetoothViewModel.getService()
            if (it) {
                val task = taskCompletionViewModel.taskLiveData.value
                val packet = task?.let { it1 -> createTaskStatusUpdatePacket(it1) }
                lifecycleScope.launch {
                    service?.sendLongData(packet ?: "")
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        sharedBluetoothViewModel.bindService(this)
    }

    override fun onStop() {
        super.onStop()
        sharedBluetoothViewModel.unbindService(this)
    }
}