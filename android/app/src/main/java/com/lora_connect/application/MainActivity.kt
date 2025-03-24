package com.lora_connect.application

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Build
import android.os.Build.VERSION
import android.os.Bundle
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat
import com.lora_connect.application.authentication.AuthenticationScreen
import com.lora_connect.application.authentication.AuthenticationViewModel
import com.lora_connect.application.map.MapActivity
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.services.BluetoothService
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.ActivityStarterHelper

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "MAIN ACTIVITY"
    }

    private lateinit var taskRepository : TaskRepository
    private lateinit var bluetoothManager : BluetoothManager
    private lateinit var bluetoothAdapter : BluetoothAdapter
    private lateinit var bleScanner : BluetoothLeScanner
    private lateinit var authenticationViewModel: AuthenticationViewModel
    private var bluetoothService : BluetoothService? = null

    private val bluetoothLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        try {
            Log.w(TAG, it.data?.data.toString())
        } catch (e: Error) {
            Log.d(TAG, e.toString())
        }
    }

    // Code to manage Service lifecycle.
    private val serviceConnection: ServiceConnection = object : ServiceConnection {
        override fun onServiceConnected(
            componentName: ComponentName,
            service: IBinder,
        ) {
            val binder = service as BluetoothService.LocalBinder
            bluetoothService = binder.getService()
            bluetoothService.let { it?.initialize() }
        }

        override fun onServiceDisconnected(componentName: ComponentName) {
            bluetoothService = null
        }
    }

    override fun onStart() {
        super.onStart()

        val gattServiceIntent = Intent(this, BluetoothService::class.java)
        bindService(gattServiceIntent, serviceConnection, Context.BIND_AUTO_CREATE)

//        UNCOMMENT ONLY WHEN SEEDING DB
//         populateTasksDB()

        val intent = Intent(this, MapActivity::class.java)
        startActivity(intent)
    }

    override fun onStop() {
        super.onStop()
        unbindService(serviceConnection)
    }

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        taskRepository = TaskRepository(this)
        bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager.adapter
        bleScanner = bluetoothAdapter.bluetoothLeScanner

        registerReceiver(bluetoothEnabledStateBroadcastReceiver, IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED))

        if (VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(gattUpdateReceiver, makeGattUpdateIntentFilter(), RECEIVER_NOT_EXPORTED)
        }

        askNotificationPermission()

        val activityStarterHelper = ActivityStarterHelper(this)
        authenticationViewModel = AuthenticationViewModel(bluetoothAdapter, bleScanner, activityStarterHelper, ::connectToDevice, ::launchEnableBluetoothIntent)

        setContent {
            ApplicationTheme {
                AuthenticationScreen(authenticationViewModel)
            }
        }
    }

    private fun launchEnableBluetoothIntent() {
        val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
        bluetoothLauncher.launch(enableBtIntent)
    }

    private val bluetoothEnabledStateBroadcastReceiver = object : BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        override fun onReceive(context: Context, intent: Intent) {
            val action: String = intent.action!!
            when(action) {
                BluetoothAdapter.ACTION_STATE_CHANGED -> {
                    val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
                    when (state) {
                        BluetoothAdapter.STATE_OFF -> {
                            authenticationViewModel.setEnabledBluetoothState(false)
                        }
                        BluetoothAdapter.STATE_ON -> {
                            authenticationViewModel.setEnabledBluetoothState(true)
                        }
                    }
                }
            }
        }
    }

    private val gattUpdateReceiver: BroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                BluetoothService.ACTION_GATT_CONNECTED -> {
                    Log.w(TAG, "CONNECTED")
                }
                BluetoothService.ACTION_GATT_DISCONNECTED -> {
                    Log.w(TAG, "DISCONNECTED")
                }
                BluetoothService.ACTION_GATT_SERVICES_DISCOVERED -> {
                    Log.w(TAG, "GATT SERVICESS DISCOVERED")
                }
                BluetoothService.ACTION_DATA_AVAILABLE -> {
                    val data = intent.getStringExtra(BluetoothService.EXTRA_DATA)
                    Log.d(TAG, "Received: $data")
                }
            }
        }
    }

    private fun makeGattUpdateIntentFilter(): IntentFilter {
        return IntentFilter().apply {
            addAction(BluetoothService.ACTION_GATT_CONNECTED)
            addAction(BluetoothService.ACTION_GATT_DISCONNECTED)
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(gattUpdateReceiver)
        unregisterReceiver(bluetoothEnabledStateBroadcastReceiver)
    }

    private fun connectToDevice(address: String) {
        bluetoothService.let { service ->
            service?.connect(address)
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level >= 33 (TIRAMISU)
        if (VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
//                Log.e(TAG, "PERMISSION_GRANTED")
                // FCM SDK (and your app) can post notifications.
            } else {
//                Log.e(TAG, "NO_PERMISSION")
                // Directly ask for the permission
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }


    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Toast.makeText(this, "Notifications permission granted", Toast.LENGTH_SHORT)
                .show()
        } else {
            if (VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val settingsIntent: Intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
                startActivity(settingsIntent)
            }
        }
    }


    // UTILITY FUNCTION FOR TESTING
    // UNCOMMENT ONLY WHEN SEEDING ROOM DB
//    private fun populateTasksDB() {
//        lifecycle.coroutineScope.launch (Dispatchers.IO) {
//            val newTask = Task(8, Date(), 1, 1, 2, 15.157092f, 120.59178f, 1.2f, 1,
//                15.16985f, 120.579285f, TaskStatus.ASSIGNED, TaskUrgency.LOW, "")
//            val newTask2 = Task(9, Date(), 1, 1, 2, 15.1547985f, 120.6055f, 1.2f, 1,
//                15.16985f, 120.579285f, TaskStatus.ASSIGNED, TaskUrgency.MODERATE, "")
//            val newTask3 = Task(10, Date(), 1, 1, 2, 15.166502f, 120.60531f, 1.2f, 1,
//                15.16985f, 120.579285f, TaskStatus.ASSIGNED, TaskUrgency.SEVERE, "")
//            taskRepository.createTask(newTask)
//            taskRepository.createTask(newTask2)
//            taskRepository.createTask(newTask3)
//        }
//    }
}