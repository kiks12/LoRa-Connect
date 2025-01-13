package com.lora_connect.application.utils

import android.content.Context
import android.content.Intent

class ActivityStarterHelper(private val context: Context) {
    fun startActivity(activity: Class<*>) {
        val intent = Intent(context, activity)
        context.startActivity(intent)
    }
}