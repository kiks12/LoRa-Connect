package com.lora_connect.application.utils

import android.content.Context
import android.content.Intent
import com.lora_connect.application.map.MapActivity

class ActivityStarterHelper(private val context: Context) {
    fun startActivity(activity: Class<*>) {
        val intent = Intent(context, activity)
        context.startActivity(intent)
    }

    fun startMapActivity(deviceAddress: String) {
        val intent = Intent(context, MapActivity::class.java).apply {
            putExtra("DEVICE_ADDRESS", deviceAddress)
        }
        context.startActivity(intent)
    }
}