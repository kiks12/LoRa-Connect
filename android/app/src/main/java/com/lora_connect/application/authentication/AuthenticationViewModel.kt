package com.lora_connect.application.authentication

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.Intent
import android.os.Looper
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.map.MapActivity
import com.lora_connect.application.utils.ActivityStarterHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

@SuppressLint("MissingPermission")
class AuthenticationViewModel(
    private val bluetoothAdapter: BluetoothAdapter,
    private val activityStarterHelper: ActivityStarterHelper,
): ViewModel(){
    private val _state = MutableStateFlow(AuthenticationState())
    val state : StateFlow<AuthenticationState> = _state.asStateFlow()
    private val handler = android.os.Handler(Looper.getMainLooper())

    fun refresh() {
        _state.value = _state.value.copy(
            bondedDevices = bluetoothAdapter.bondedDevices,
            permissionDenied = false
        )
    }

    fun permissionDenied() {
        _state.value = _state.value.copy(
            permissionDenied = true
        )
    }

    fun addUnnamedDiscoveredDevice(bluetoothDevice: BluetoothDevice) {
        _state.value = _state.value.copy(
            unnamedDiscoveredDevices = _state.value.unnamedDiscoveredDevices.plus(bluetoothDevice),
        )
    }

    fun addNamedDiscoveredDevice(bluetoothDevice: BluetoothDevice) {
        _state.value = _state.value.copy(
            namedDiscoveredDevices = _state.value.namedDiscoveredDevices.plus(bluetoothDevice),
        )
    }

    private fun toggleDiscoveringLoading() {
        _state.value = _state.value.copy(
            discoveringDevicesLoading = !_state.value.discoveringDevicesLoading
        )
    }

    fun discoverDevices() {
        viewModelScope.launch {
            bluetoothAdapter.startDiscovery()
            toggleDiscoveringLoading()
            val runnable = Runnable {
                run {
                    bluetoothAdapter.cancelDiscovery()
                    toggleDiscoveringLoading()
                }
            }
            handler.postDelayed(runnable, 12000)
        }
    }

    fun connectDevice(bluetoothDevice: BluetoothDevice) {
        viewModelScope.launch {
            bluetoothAdapter.cancelDiscovery()
            val socket = bluetoothDevice.createRfcommSocketToServiceRecord(UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"))
            socket.use { bluetoothSocket ->
                try {
                    bluetoothSocket.connect()
                    AuthenticationSocket.loginSocket(bluetoothSocket)
                    activityStarterHelper.startActivity(MapActivity::class.java)
                } catch (e: Error) {
                    Log.w("AUTHENTICATION VIEW MODEL", e.toString())
                }
            }
        }
    }
}