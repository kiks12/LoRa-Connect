package com.lora_connect.application.utils

import android.content.Context
import android.widget.Toast

class ToastHelper(private val context: Context){
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}