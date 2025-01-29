package com.lora_connect.application.authentication

import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.SharedPreferences
import com.lora_connect.application.utils.LOGGED_IN_KEY
import com.lora_connect.application.utils.PREFERENCES_KEY

// DELETE IF UNNECESSARY
object  AuthenticationSocket {
    var socket : BluetoothSocket? = null
    private lateinit var sharedPreferences: SharedPreferences

    fun init(context: Context) {
        sharedPreferences = context.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE)
    }

    fun loginSocket(bluetoothSocket: BluetoothSocket) {
        socket = bluetoothSocket
        setLoggedIn()
    }

    private fun setLoggedIn() {
        sharedPreferences.edit().putBoolean(LOGGED_IN_KEY, true).apply()
    }

    fun getLoggedIn() : Boolean {
        return sharedPreferences.getBoolean(LOGGED_IN_KEY, false)
    }

    fun logoutSocket() {
        socket = null
        sharedPreferences.edit().putBoolean(LOGGED_IN_KEY, false).apply()
    }
}