package com.lora_connect.application

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.os.Build
import android.os.Build.VERSION
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import com.lora_connect.application.authentication.AuthenticationScreen
import com.lora_connect.application.authentication.AuthenticationViewModel
import com.lora_connect.application.map.MapActivity
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.ActivityStarterHelper
import com.lora_connect.application.utils.PREFERENCES_KEY

class MainActivity : ComponentActivity() {
    private lateinit var sharedPreferences : SharedPreferences
    private lateinit var bluetoothManager : BluetoothManager
    private lateinit var bluetoothAdapter: BluetoothAdapter
    private lateinit var authenticationViewModel: AuthenticationViewModel

    private val bluetoothLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        Log.w("MAIN ACTIVITY", it.data?.data.toString())
    }

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sharedPreferences = getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE)
        bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager.adapter

        val filter = IntentFilter(BluetoothDevice.ACTION_FOUND)
        registerReceiver(bluetoothBroadcastReceiver, filter)
        val activityStarterHelper = ActivityStarterHelper(this)
        authenticationViewModel = AuthenticationViewModel(bluetoothAdapter, activityStarterHelper)

        setContent {
            ApplicationTheme {
                AuthenticationScreen(authenticationViewModel)
            }
        }
    }

    override fun onStart() {
        super.onStart()

        val intent = Intent(this, MapActivity::class.java)
        startActivity(intent)
        finish()

//        AuthenticationSocket.init(this)
//        val loggedIn = AuthenticationSocket.getLoggedIn()
//        if (loggedIn) startMapActivity()
//
//        if (!(bluetoothAdapter.isEnabled)) {
//            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
//            bluetoothLauncher.launch(enableBtIntent)
//        }
    }

    private fun startMapActivity() {
        val intent = Intent(this, MapActivity::class.java)
        startActivity(intent)
        finish()
    }

    private val bluetoothBroadcastReceiver = object : BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        override fun onReceive(context: Context, intent: Intent) {
            val action: String = intent.action!!
            when(action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val device = if (VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                       intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    val name = device?.name
                    if (device != null && name != null) authenticationViewModel.addNamedDiscoveredDevice(device)
                    if (device != null && name == null) authenticationViewModel.addUnnamedDiscoveredDevice(device)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(bluetoothBroadcastReceiver)
    }
}