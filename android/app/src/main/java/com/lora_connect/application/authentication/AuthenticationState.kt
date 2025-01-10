package com.lora_connect.application.authentication

import android.bluetooth.BluetoothDevice

data class AuthenticationState(
    val bondedDevices: Set<BluetoothDevice> = emptySet(),
    val discoveredDevices: Set<BluetoothDevice> = emptySet(),
    val discoveringDevicesLoading: Boolean = false,
    val permissionDenied: Boolean = false,
)
