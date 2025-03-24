package com.lora_connect.application.services

import android.Manifest
import android.app.Service
import android.bluetooth.*
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Binder
import android.os.IBinder
import android.util.Log
import androidx.core.app.ActivityCompat
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
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

        const val SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
        const val CHARACTERISTIC_UUID = "abcdef12-3456-7890-1234-56789abcdef1"
        const val DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb" // Standard CCCD UUID

        const val WRITE_CHARACTERISTIC_UUID = "ghijkl12-3456-7890-1234-56789abcdef1"
    }

    private val binder = LocalBinder()
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothGatt: BluetoothGatt? = null
    private var connectionState = STATE_DISCONNECTED
    private val taskRepository = TaskRepository(this)
    private var finalData = ""
    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.IO + job)

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
                broadcastUpdate(ACTION_GATT_SERVICES_DISCOVERED)
                Log.i(TAG, "Services discovered. Attempting to enable notifications.")

                val characteristic = gatt.getService(UUID.fromString(SERVICE_UUID))
                    ?.getCharacteristic(UUID.fromString(CHARACTERISTIC_UUID))

                characteristic?.let {
                    enableNotifications(gatt, it)
                } ?: Log.e(TAG, "Characteristic not found!")
            } else {
                Log.w(TAG, "onServicesDiscovered received: $status")
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

    fun initialize(): Boolean {
        val bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager?.adapter
        return bluetoothAdapter != null
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
                return true
            } catch (exception: IllegalArgumentException) {
                Log.w(TAG, "Device not found with provided address.")
                return false
            }
        } ?: return false
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
        val source = data.substring(0, 4)
        val dest = data.substring(4, 8)
        val id = data[8]
        val packetType = data[9]
        val ttl = data[10]
        val payload = data.substring(11, data.length)
        Log.w(TAG, "SOURCE: $source DEST: $dest ID: $id PACKET_TYPE: $packetType TTL: $ttl")
        when (packetType) {
            '9' -> processTaskData(payload)
            else -> Log.w(TAG, "NO PROCESSING")
        }
    }

    private fun processTaskData(payload: String) {
        val list = payload.split("-")
        val missionId = list[0]
        val userName = list[1]
        val latitude = list[2].toFloat()
        val longitude = list[3].toFloat()
        val numberOfVictims = list[4].toInt()
        val status = when (list[5]) {
            "1" -> TaskStatus.ASSIGNED
            "2" -> TaskStatus.PENDING
            "3" -> TaskStatus.CANCELED
            "4" -> TaskStatus.FAILED
            "5" -> TaskStatus.COMPLETE
            else -> TaskStatus.ASSIGNED
        }
        val urgency = when (list[6]) {
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
            userId = null,
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
            taskRepository.createTask(newTask)
        }
        Log.w(TAG, newTask.toString())
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
