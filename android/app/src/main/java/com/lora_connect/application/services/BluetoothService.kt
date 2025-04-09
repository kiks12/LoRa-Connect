package com.lora_connect.application.services

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.*
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.lora_connect.application.R
import com.lora_connect.application.authentication.BluetoothSessionManager
import com.lora_connect.application.repositories.ObstacleRepository
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Obstacle
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.io.IOException
import java.util.Date
import java.util.UUID

class BluetoothService : Service() {

    companion object {
        private const val TAG = "BluetoothService"

        const val ACTION_GATT_CONNECTED = "com.example.bluetooth.le.ACTION_GATT_CONNECTED"
        const val ACTION_GATT_DISCONNECTED = "com.example.bluetooth.le.ACTION_GATT_DISCONNECTED"
        const val ACTION_GATT_SERVICES_DISCOVERED = "com.example.bluetooth.le.ACTION_GATT_SERVICES_DISCOVERED"
        const val ACTION_DATA_AVAILABLE = "com.example.bluetooth.le.ACTION_DATA_AVAILABLE"
        const val EXTRA_DATA = "com.example.bluetooth.le.EXTRA_DATA"

        private const val STATE_DISCONNECTED = 0
        private const val STATE_CONNECTED = 2

        const val SERVICE_UUID = "dc0d15eb-6298-44e3-9813-d9a5c58c43cc"
        const val CHARACTERISTIC_UUID = "d0d12d27-be27-4495-a236-9fa0860b4554"
        const val DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb" // Standard CCCD UUID

        const val WRITE_CHARACTERISTIC_UUID = "c31628d9-f40c-4e67-a03a-3a0445b44ce0"

        private const val BLUETOOTH_CHANNEL = "bluetooth_channel"
        private const val BLUETOOTH_SERVICE_NAME = "Bluetooth Service"
    }

    private val binder = LocalBinder()
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothSocket: BluetoothSocket? = null
    private var bluetoothGatt: BluetoothGatt? = null
    private var connectionState = STATE_DISCONNECTED
    private val taskRepository = TaskRepository(this)
    private val obstacleRepository = ObstacleRepository(this)
    private var finalData = ""
    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.IO + job)
    private val handler = Handler(Looper.getMainLooper())

    inner class LocalBinder : Binder() {
        fun getService(): BluetoothService = this@BluetoothService
    }

    private val bluetoothGattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                connectionState = STATE_CONNECTED
                broadcastUpdate(ACTION_GATT_CONNECTED)
                Log.i(TAG, "Connected to GATT server.")
                if (ActivityCompat.checkSelfPermission(
                        this@BluetoothService,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    return
                }
                gatt.discoverServices()
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                connectionState = STATE_DISCONNECTED
                Log.w(TAG, "Disconnected from GATT server.")
                broadcastUpdate(ACTION_GATT_DISCONNECTED)
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                for (service in gatt.services) {
                    Log.d(TAG, "Service: ${service.uuid}")
                    for (characteristic in service.characteristics) {
                        Log.d(TAG, "  Characteristic: ${characteristic.uuid}")
                    }
                }

                val service = gatt.getService(UUID.fromString(SERVICE_UUID))
                Log.d(TAG, service.toString())
                if (service == null) {
                    handler.post {
                        Toast.makeText(
                            this@BluetoothService,
                            "BLE Service not found!",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    Log.e(TAG, "Service not found!")
                    return
                }

                val characteristic = service.getCharacteristic(UUID.fromString(CHARACTERISTIC_UUID))
                Log.d(TAG, characteristic.toString())
                if (characteristic == null) {
                    handler.post {
                        Toast.makeText(
                            this@BluetoothService,
                            "BLE Characteristic not found!",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    Log.e(TAG, "Characteristic not found!")
                    return
                }

                enableNotifications(gatt, characteristic)
            } else {
                handler.post {
                    Toast.makeText(
                        this@BluetoothService,
                        "Failed to discover services",
                        Toast.LENGTH_SHORT
                    ).show()
                }
                Log.w(TAG, "onServicesDiscovered failed with status: $status")
            }
        }

        @Deprecated("Deprecated in Java")
        override fun onCharacteristicChanged(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
            broadcastUpdate(ACTION_DATA_AVAILABLE, characteristic)
        }

        @Deprecated("Deprecated in Java")
        override fun onCharacteristicRead(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                broadcastUpdate(ACTION_DATA_AVAILABLE, characteristic)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        startForegroundService()
    }

    fun initialize(): Boolean {
        val bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager?.adapter
        return bluetoothAdapter != null
    }

    // Start foreground service with notification
    private fun startForegroundService() {
        createNotificationChannel()

        val notification = NotificationCompat.Builder(this, BLUETOOTH_CHANNEL)
            .setContentTitle("Bluetooth Connection")
            .setContentText("Bluetooth Service is currently working")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .build()

        startForeground(1, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                BLUETOOTH_CHANNEL, // Unique Channel ID
                BLUETOOTH_SERVICE_NAME,
                NotificationManager.IMPORTANCE_LOW // No sound/vibration
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    fun showNotification(context: Context, title: String, message: String) {
        createNotificationChannel() // Ensure the channel exists

        val notification = NotificationCompat.Builder(context, BLUETOOTH_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher_background)  // Use a valid drawable icon
            .setContentTitle(title)  // Notification title
            .setContentText(message)  // Notification message
            .setPriority(NotificationCompat.PRIORITY_HIGH)  // High importance for pop-up notifications
            .setAutoCancel(true)  // Dismiss when tapped
            .build()

        val manager = NotificationManagerCompat.from(context)
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        manager.notify(1, notification)  // Show notification with ID 1
    }

    fun connect(address: String): Boolean {
        bluetoothAdapter?.let { adapter ->
            try {
                val device = adapter.getRemoteDevice(address)
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    return false
                }
                bluetoothGatt = device.connectGatt(this, false, bluetoothGattCallback)
                bluetoothGatt?.requestMtu(512)
                BluetoothSessionManager.bluetoothDevice = device
                showNotification(application, "Bluetooth Connected", "Connected to ${device.name}")
                return true
            } catch (exception: IllegalArgumentException) {
                Log.w(TAG, "Device not found with provided address.")
                return false
            }
        } ?: return false
    }

    fun disconnectDevice() {
        try {
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.BLUETOOTH_CONNECT
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
            bluetoothGatt?.disconnect() // BLE
            bluetoothGatt?.close()

            bluetoothSocket = null
            bluetoothGatt = null

            Log.d("BluetoothService", "Device disconnected")
        } catch (e: IOException) {
            Log.e("BluetoothService", "Error while disconnecting", e)
        }
    }

    @Suppress("DEPRECATION")
    private fun enableNotifications(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
        Log.i(TAG, "Enabling notifications for ${characteristic.uuid}")

        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.BLUETOOTH_CONNECT
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        gatt.setCharacteristicNotification(characteristic, true)

        val descriptor = characteristic.getDescriptor(UUID.fromString(DESCRIPTOR_UUID))
        descriptor?.let {
            it.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.BLUETOOTH_CONNECT
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
            gatt.writeDescriptor(it)
            Log.i(TAG, "Notification enabled")
        } ?: Log.e(TAG, "Descriptor not found!")
    }

    @Suppress("DEPRECATION")
    private fun broadcastUpdate(action: String, characteristic: BluetoothGattCharacteristic? = null) {
        val intent = Intent(action)

        characteristic?.let {
            val data = it.value
            if (data != null) {
                val stringValue = String(data, Charsets.UTF_8)
                Log.d(TAG, stringValue)
                finalData += stringValue
                intent.putExtra(EXTRA_DATA, finalData)
                if (stringValue.contains("-ENDP")) {
                    processData(finalData)
                    finalData = ""
                }
            }
        }

        sendBroadcast(intent)
    }

    private fun processData(data: String) {
        Log.w("BluetoothService", data)
        val source = data.substring(0, 4)
        val dest = data.substring(4, 8)
        val id = data.substring(8, 10)
        val packetType = data[10]
        val ttl = data[11]
        val payload = data.substring(12, data.length)
        Log.w(TAG, "SOURCE: $source DEST: $dest ID: $id PACKET_TYPE: $packetType TTL: $ttl")
        when (packetType) {
            '9' -> processTaskData(payload)
            'B' -> processObstacleData(payload)
            else -> Log.w(TAG, "NO PROCESSING")
        }
    }

    private fun processObstacleData(payload: String) {
        val list = payload.split("-")
        val obstacleId = list[0].toInt()
        val name = list[1]
        val type = list[2]
        val latitude = list[3].toFloat()
        val longitude = list[4].toFloat()

        val newObstacle = Obstacle(
            obstacleId = obstacleId,
            name = name,
            type = type,
            latitude = latitude,
            longitude = longitude
        )

        scope.launch {
            try {
                obstacleRepository.createObstacle(newObstacle)
                showNotification(application, "New Obstacle Received!", "You have received a new obstacle data from central node")
            } catch (e: Exception) {
                Log.d(TAG, "OBSTACLE ID ALREADY RECEIVED")
            }
        }
    }

    private fun processTaskData(payload: String) {
        val list = payload.split("-")
        val missionId = list[0]
        val userId = list[1]
        val userName = list[2]
        val latitude = list[3].toFloat()
        val longitude = list[4].toFloat()
        val numberOfVictims = list[5].toInt()
        val status = when (list[6]) {
            "1" -> TaskStatus.ASSIGNED
            "2" -> TaskStatus.PENDING
            "3" -> TaskStatus.CANCELED
            "4" -> TaskStatus.FAILED
            "5" -> TaskStatus.COMPLETE
            else -> TaskStatus.ASSIGNED
        }
        val urgency = when (list[7]) {
            "1" -> TaskUrgency.LOW
            "2" -> TaskUrgency.MODERATE
            "3" -> TaskUrgency.SEVERE
            else -> TaskUrgency.LOW
        }
        val newTask = Task(
            missionId = missionId,
            dateTime = Date(),
            createdAt = Date(),
            latitude = latitude,
            longitude = longitude,
            userId = userId,
            userName = userName,
            status = status,
            distance = null,
            eta = null,
            urgency = urgency,
            timeOfArrival = null,
            timeOfCompletion = null,
            numberOfRescuee = numberOfVictims,
            notes = null,
            teamId = null
        )
        scope.launch {
            try {
                taskRepository.createTask(newTask)
                showNotification(application, "New Mission Received!", "You have received a new mission from central node")
            } catch (e: Exception) {
                Log.d(TAG, "MISSION ID ALREADY RECEIVED")
            }
        }
    }

    override fun onUnbind(intent: Intent?): Boolean {
        close()
        return super.onUnbind(intent)
    }

    private fun close() {
        bluetoothGatt?.let {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                return
            }
            it.close()
            bluetoothGatt = null
        }
    }

    fun sendLongData(data: String) {
        bluetoothGatt?.let { gatt ->
            val service = gatt.getService(UUID.fromString(SERVICE_UUID))
            val characteristic = service.getCharacteristic(UUID.fromString(WRITE_CHARACTERISTIC_UUID))

            val maxLength = 20
            val bytes = data.toByteArray()

            for (i in bytes.indices step maxLength) {
                val chunk = bytes.copyOfRange(i, minOf(i + maxLength, bytes.size))
                characteristic.value = chunk
                if (ActivityCompat.checkSelfPermission(
                        this,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    return
                }
                gatt.writeCharacteristic(characteristic)
                Thread.sleep(100) // Delay to avoid packet loss
            }
        }
    }
}
