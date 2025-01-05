package com.lora_connect.application

import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.lora_connect.application.components.OfflineMap
import com.lora_connect.application.map.MapViewModel
import com.lora_connect.application.ui.theme.ApplicationTheme
import org.maplibre.android.MapLibre

class MainActivity : ComponentActivity() {

    private lateinit var fusedLocationProviderClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        MapLibre.getInstance(this)
        val mapViewModel = MapViewModel(fusedLocationProviderClient, ::areLocationPermissionsGranted)

        setContent {
            ApplicationTheme {
                OfflineMap(mapViewModel, modifier = Modifier.fillMaxSize())
            }
        }
    }

    private fun areLocationPermissionsGranted() : Boolean {
        val fineLocationPermission =
            ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
        val coarseLocationPermission =
            ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION)

        return fineLocationPermission == PackageManager.PERMISSION_GRANTED &&
                coarseLocationPermission == PackageManager.PERMISSION_GRANTED
    }
}