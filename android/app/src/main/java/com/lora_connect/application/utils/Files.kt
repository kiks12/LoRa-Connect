package com.lora_connect.application.utils

import android.content.Context
import android.util.Log
import java.io.File
import java.io.IOException

fun copyAssetsToFilesDir(context: Context, assetDir: String, targetDir: File) {
    // do nothing - return if folder exists in filesDir
    if (targetDir.exists() && targetDir.isDirectory()) return

    val assetManager = context.assets
    try {
        val assetFiles = assetManager.list(assetDir) ?: return

        if (!targetDir.exists()) {
            targetDir.mkdirs()
        }

        for (fileName in assetFiles) {
            val assetPath = "$assetDir/$fileName"
            val targetFile = File(targetDir, fileName)

            if (assetManager.list(assetPath)?.isNotEmpty() == true) {
                // Recursive call for directories
                copyAssetsToFilesDir(context, assetPath, targetFile)
            } else {
                // Copy file
                assetManager.open(assetPath).use { inputStream ->
                    targetFile.outputStream().use { outputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
                Log.w("OFFLINE ROUTING", "File Copied")
            }
        }
    } catch (e: IOException) {
        e.printStackTrace()
    }
}
