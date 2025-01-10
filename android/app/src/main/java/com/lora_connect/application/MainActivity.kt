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
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import com.lora_connect.application.authentication.AuthenticationScreen
import com.lora_connect.application.authentication.AuthenticationViewModel
import com.lora_connect.application.map.MapActivity
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.LOGGED_IN_KEY
import com.lora_connect.application.utils.PREFERENCES_KEY

class MainActivity : ComponentActivity() {
    private lateinit var sharedPreferences : SharedPreferences
    private lateinit var bluetoothManager : BluetoothManager
    private lateinit var bluetoothAdapter: BluetoothAdapter
    private lateinit var authenticationViewModel: AuthenticationViewModel

    private val bluetoothLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        Log.w("MAIN ACTIVITY", it.data?.data.toString())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sharedPreferences = getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE)
        bluetoothManager = getSystemService(BluetoothManager::class.java)
        bluetoothAdapter = bluetoothManager.adapter

        if (bluetoothAdapter == null) {
            Toast.makeText(this, "Bluetooth is not supported in this device", Toast.LENGTH_SHORT).show()
            setContent {
                ApplicationTheme {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Text(text = "Bluetooth not supported")
                    }
                }
            }
        }

        val filter = IntentFilter(BluetoothDevice.ACTION_FOUND)
        registerReceiver(bluetoothBroadcastReceiver, filter)
        authenticationViewModel = AuthenticationViewModel(bluetoothAdapter)

        setContent {
            ApplicationTheme {
                AuthenticationScreen(authenticationViewModel)
            }
        }
    }

    override fun onStart() {
        super.onStart()

        val loggedIn = sharedPreferences.getBoolean(LOGGED_IN_KEY, false)
        if (loggedIn) startMapActivity()

        if (!(bluetoothAdapter.isEnabled)) {
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            bluetoothLauncher.launch(enableBtIntent)
        }
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
                    val device: BluetoothDevice? =
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    if (device != null) authenticationViewModel.addDiscoveredDevice(device)
//                    Log.w("MAIN ACTIVITY", device?.name!!.toString())
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(bluetoothBroadcastReceiver)
    }
}