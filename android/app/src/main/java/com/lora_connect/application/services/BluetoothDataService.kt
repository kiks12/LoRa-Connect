package com.lora_connect.application.services

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException
import java.io.InputStream
import java.util.Date
import java.util.UUID

class BluetoothDataService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var bluetoothManager: BluetoothManager
    private lateinit var bluetoothAdapter: BluetoothAdapter
    private lateinit var bluetoothSocket: BluetoothSocket
    private lateinit var repository: TaskRepository

    companion object {
        private const val CHANNEL_ID = "BluetoothServiceChannel"
        private val UUID_SPP: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // SPP UUID
    }

    override fun onCreate() {
        super.onCreate()
        repository = TaskRepository(applicationContext)
        bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager.adapter
        startForegroundService()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val deviceAddress = intent?.getStringExtra("DEVICE_ADDRESS")
        deviceAddress?.let {
            serviceScope.launch {
                connectToDevice(it)
            }
        }

        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private suspend fun connectToDevice(deviceAddress: String) {
        withContext(Dispatchers.IO) {
            val device = bluetoothAdapter.getRemoteDevice(deviceAddress)
            try {
                bluetoothSocket = device.createRfcommSocketToServiceRecord(UUID_SPP)
                bluetoothSocket.connect()
                listenForData()
            } catch (e: IOException) {
                e.printStackTrace()
                stopSelf() // Stop service if connection fails
            }
        }
    }


    private fun startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Bluetooth Task Listener",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Task Receiver Active")
            .setContentText("Listening for incoming tasks via Bluetooth...")
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .build()

        startForeground(1, notification)
    }

    @SuppressLint("MissingPermission")
    private suspend fun listenForData() {
        var currentText = ""
        withContext(Dispatchers.IO) {
            bluetoothSocket.let { socket ->
                val inputStream: InputStream = socket.inputStream
                val buffer = ByteArray(1024)
                while (true) {
                    try {
                        val bytesRead = inputStream.available().let { inputStream.read(buffer, 0, it) }
                        if (bytesRead > 0) {
                            val receivedData = String(buffer, 0, bytesRead)
                            currentText += receivedData
                        }

                        if (currentText.length >= 25) {
                            Log.w("BLUETOOTH DATA SERVICE", "RECEIVED DATA: $currentText")
                            currentText = ""
                        }
                    } catch (e: IOException) {
                        e.printStackTrace()
                        stopSelf()
                    }
                }
            }
        }
    }

    private fun processReceivedTask(receivedData: String) {
        val dataParts = receivedData.split(",")

        if (dataParts.size < 10) {
            Log.e("BluetoothService", "Invalid task data received")
            return
        }

        val receivedTask = Task(
            ownerId = dataParts[0].toIntOrNull(),
            rescuerId = dataParts[1].toIntOrNull(),
            numberOfVictims = dataParts[2].toInt(),
            latitude = dataParts[3].toFloat(),
            longitude = dataParts[4].toFloat(),
            distance = dataParts[5].toFloat(),
            evacuationCenterId = dataParts[6].toInt(),
            evacuationLatitude = dataParts[7].toFloat(),
            evacuationLongitude = dataParts[8].toFloat(),
            status = TaskStatus.valueOf(dataParts[9]),
            urgency = TaskUrgency.valueOf(dataParts[10]),
            date = Date(),
            uid = null,
            notes = "",
            time = 0F
        )

        CoroutineScope(Dispatchers.IO).launch {
            repository.createTask(receivedTask)
            sendTaskNotification(receivedTask)
        }
    }

    private fun sendTaskNotification(task: Task) {
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channelId = "TaskNotificationChannel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "Task Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("New Rescue Task Received")
            .setContentText("Urgency: ${task.urgency}, Victims: ${task.numberOfVictims}")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        notificationManager.notify(task.hashCode(), notification)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
