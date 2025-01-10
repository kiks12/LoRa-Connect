package com.lora_connect.application.authentication

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@SuppressLint("MissingPermission")
class AuthenticationViewModel(
    private val bluetoothAdapter: BluetoothAdapter
): ViewModel(){
    private val _state = MutableStateFlow(AuthenticationState())
    val state : StateFlow<AuthenticationState> = _state.asStateFlow()

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

    fun addDiscoveredDevice(bluetoothDevice: BluetoothDevice) {
        _state.value = _state.value.copy(
            discoveredDevices = _state.value.discoveredDevices.plus(bluetoothDevice),
            discoveringDevicesLoading = false
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
        }
    }
}