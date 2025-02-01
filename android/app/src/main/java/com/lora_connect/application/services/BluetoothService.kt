package com.lora_connect.application.services

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
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
import kotlinx.coroutines.launch
import java.io.IOException
import java.io.InputStream
import java.util.Date

class BluetoothService : Service() {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private lateinit var repository: TaskRepository

    override fun onCreate() {
        super.onCreate()
        repository = TaskRepository(applicationContext)
        startForegroundService()
        connectToBluetoothDevice()
    }

    private fun startForegroundService() {
        val channelId = "BluetoothTaskChannel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "Bluetooth Task Listener",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Task Receiver Active")
            .setContentText("Listening for incoming tasks via Bluetooth...")
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .build()

        startForeground(1, notification)
    }

    @SuppressLint("MissingPermission")
    private fun connectToBluetoothDevice() {
        CoroutineScope(Dispatchers.IO).launch{
            val device: BluetoothDevice? = getPairedDevice()

            device?.let {
                try {
                    val uuid = it.uuids[0].uuid
                    bluetoothSocket = it.createRfcommSocketToServiceRecord(uuid)
                    bluetoothSocket?.connect()

                    Log.d("BluetoothService", "Connected to ${device.name}")
                    listenForData()
                } catch (e: IOException) {
                    Log.e("BluetoothService", "Connection failed", e)
                }
            }
        }
    }

    private fun listenForData() {
        bluetoothSocket?.let { socket ->
            val inputStream: InputStream = socket.inputStream
            val buffer = ByteArray(1024)
            var bytes: Int

            while (true) {
                try {
                    bytes = inputStream.read(buffer)
                    val receivedMessage = String(buffer, 0, bytes)

                    Log.d("BluetoothService", "Received: $receivedMessage")
                    processReceivedTask(receivedMessage)
                } catch (e: IOException) {
                    Log.e("BluetoothService", "Error reading data", e)
                    break
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
            uid = null
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

    @SuppressLint("MissingPermission")
    private fun getPairedDevice(): BluetoothDevice? {
        return bluetoothAdapter?.bondedDevices?.firstOrNull()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
