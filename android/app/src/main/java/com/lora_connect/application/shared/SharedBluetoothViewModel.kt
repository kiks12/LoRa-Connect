package com.lora_connect.application.shared

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.lifecycle.AndroidViewModel
import com.lora_connect.application.services.BluetoothService

class SharedBluetoothViewModel(application: Application) : AndroidViewModel(application) {
    private var bluetoothService: BluetoothService? = null
    private var isBound = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(className: ComponentName?, service: IBinder?) {
            val binder = service as BluetoothService.LocalBinder
            this@SharedBluetoothViewModel.bluetoothService = binder.getService()
            this@SharedBluetoothViewModel.bluetoothService?.initialize()
            isBound = true
        }

        override fun onServiceDisconnected(className: ComponentName?) {
            bluetoothService = null
            isBound = false
        }
    }

    fun bindService(context: Context) {
        val intent = Intent(context, BluetoothService::class.java)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    fun unbindService(context: Context) {
        if (isBound) {
            context.unbindService(connection)
            isBound = false
        }
    }

    fun getService(): BluetoothService? {
        return bluetoothService
    }
}