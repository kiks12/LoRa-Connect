package com.lora_connect.application.authentication

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.os.Looper
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.utils.ActivityStarterHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@SuppressLint("MissingPermission")
class AuthenticationViewModel(
    val bluetoothAdapter: BluetoothAdapter,
    private val bleScanner: BluetoothLeScanner,
    private val activityStarterHelper: ActivityStarterHelper,
    private val connectToDevice: (address: String) -> Unit,
    val enableBluetooth: () -> Unit
): ViewModel(){
    private val _state = MutableStateFlow(AuthenticationState())
    val state : StateFlow<AuthenticationState> = _state.asStateFlow()
    private val handler = android.os.Handler(Looper.getMainLooper())

    fun refresh() {
        _state.value = _state.value.copy(
            permissionDenied = false
        )
    }

    fun permissionDenied() {
        _state.value = _state.value.copy(
            permissionDenied = true
        )
    }

    fun setEnabledBluetoothState(newState: Boolean) {
        _state.value = _state.value.copy(
            enabledBluetooth = newState
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
            val scanCallback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    super.onScanResult(callbackType, result)
                    result?.device.let {
                        if (it != null && it.name != null) addNamedDiscoveredDevice(it)
                    }
                }
            }

            toggleDiscoveringLoading()
            bleScanner.startScan(scanCallback)
            handler.postDelayed({
                bleScanner.stopScan(scanCallback)
                toggleDiscoveringLoading()
            }, 10000)
        }
    }

    fun connectDevice(bluetoothDevice: BluetoothDevice) {
        viewModelScope.launch {
            connectToDevice(bluetoothDevice.address)
            activityStarterHelper.startMapActivity(bluetoothDevice.address)
        }
    }
}