package com.lora_connect.application

import android.content.Context
import java.io.File


class MapStyleManager(private val context: Context) {
    sealed class StyleSetupResult {
        data class Success(val styleFile: File) : StyleSetupResult()
        data class Error(val exception: Exception) : StyleSetupResult()
    }

    /**
     * Sets up the style file by copying from assets and replacing the mbtiles URI
     * @return StyleSetupResult indicating success or failure
     */
    fun setupStyle(): StyleSetupResult {
        return try {
            val styleFile = copyAssetToInternal(STYLE_FILENAME)
            val mbtilesFile = copyAssetToInternal(MBTILES_FILENAME)

            updateStyleFileUri(styleFile, mbtilesFile)
            StyleSetupResult.Success(styleFile)
        } catch (e: Exception) {
            StyleSetupResult.Error(e)
        }
    }

    /**
     * Copies an asset file to internal storage
     * @param assetFileName Name of the file in assets
     * @return File object pointing to the copied file
     */
    private fun copyAssetToInternal(assetFileName: String): File {
        context.assets.open(assetFileName).use { input ->
            val outputFile = File(context.filesDir, assetFileName)
            outputFile.outputStream().use { output ->
                input.copyTo(output)
            }
            return outputFile
        }
    }

    /**
     * Updates the style file with the correct mbtiles URI
     * @param styleFile The style file to update
     * @param mbtilesFile The mbtiles file reference to insert
     */
    private fun updateStyleFileUri(styleFile: File, mbtilesFile: File) {
        val styleContent = styleFile.readText()
        val updatedContent = styleContent.replace(
            FILE_URI_PLACEHOLDER,
            "mbtiles://${mbtilesFile.absolutePath}"
        )
        styleFile.writeText(updatedContent)
    }

    companion object {
        private const val STYLE_FILENAME = "style-raw-open.json"
        private const val MBTILES_FILENAME = "output.mbtiles"
        private const val FILE_URI_PLACEHOLDER = "___FILE_URI___"
    }
}
