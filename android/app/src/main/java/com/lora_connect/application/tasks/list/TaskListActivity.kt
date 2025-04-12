package com.lora_connect.application.tasks.list

import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.lifecycle.lifecycleScope
import com.lora_connect.application.shared.SharedBluetoothViewModel
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.createTaskStartAcknowledgementPacket
import kotlinx.coroutines.launch

class TaskListActivity : ComponentActivity() {
    private lateinit var sharedBluetoothViewModel: SharedBluetoothViewModel

    companion object {
        private const val TAG = "TaskListActivity"
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sharedBluetoothViewModel = SharedBluetoothViewModel(application)
        val taskListViewModel = TaskListViewModel(application) {
            finish()
        }

        setContent {
            ApplicationTheme {
                TaskListScreen(viewModel = taskListViewModel)
            }
        }

        enableEdgeToEdge()

        taskListViewModel.startButtonClickLiveData.observe(this) {
            val service = sharedBluetoothViewModel.getService()
            if (it) {
                val taskData = taskListViewModel.taskLiveData.value
                val packet = taskData?.let { it1 -> createTaskStartAcknowledgementPacket(it1) }
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