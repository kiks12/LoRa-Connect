package com.lora_connect.application

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Build.VERSION
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.lora_connect.application.authentication.AuthenticationScreen
import com.lora_connect.application.authentication.AuthenticationViewModel
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.services.BluetoothService
import com.lora_connect.application.shared.SharedBluetoothViewModel
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.ActivityStarterHelper

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MAIN ACTIVITY"
    }

    private lateinit var taskRepository : TaskRepository
    private lateinit var bluetoothManager : BluetoothManager
    private lateinit var bluetoothAdapter : BluetoothAdapter
    private lateinit var bleScanner : BluetoothLeScanner
    private lateinit var authenticationViewModel: AuthenticationViewModel
    private lateinit var sharedBluetoothViewModel: SharedBluetoothViewModel

    private val bluetoothLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        try {
            Log.w(TAG, it.data?.data.toString())
        } catch (e: Error) {
            Log.d(TAG, e.toString())
        }
    }

    override fun onStart() {
        super.onStart()
        sharedBluetoothViewModel.bindService(this)

//        UNCOMMENT ONLY WHEN SEEDING DB
//         populateTasksDB()

//        val intent = Intent(this, MapActivity::class.java)
//        startActivity(intent)
    }

    override fun onStop() {
        super.onStop()
        sharedBluetoothViewModel.unbindService(this)
        try {
            unregisterReceiver(bluetoothEnabledStateBroadcastReceiver)
            unregisterReceiver(gattUpdateReceiver)
        } catch (e: IllegalArgumentException) {
            e.printStackTrace()
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        taskRepository = TaskRepository(this)
        bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager.adapter
        bleScanner = bluetoothAdapter.bluetoothLeScanner

        sharedBluetoothViewModel = ViewModelProvider(this, ViewModelProvider.AndroidViewModelFactory.getInstance(application))[SharedBluetoothViewModel::class.java]

        registerReceiver(bluetoothEnabledStateBroadcastReceiver, IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED))

        if (VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(gattUpdateReceiver, makeGattUpdateIntentFilter(), RECEIVER_NOT_EXPORTED)
        }

        val activityStarterHelper = ActivityStarterHelper(this)
        authenticationViewModel = AuthenticationViewModel(
            bluetoothAdapter,
            bleScanner,
            activityStarterHelper,
            ::connectToDevice,
            ::launchEnableBluetoothIntent,
        )

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
                    Log.w(TAG, "GATT SERVICES DISCOVERED")
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

    private fun connectToDevice(address: String) {
        sharedBluetoothViewModel.let { service ->
            service.getService()?.connect(address)
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