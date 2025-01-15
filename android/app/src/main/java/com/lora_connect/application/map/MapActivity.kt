package com.lora_connect.application.map

import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.copyAssetsToFilesDir
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.maplibre.android.MapLibre
import org.maplibre.android.location.LocationComponentActivationOptions
import org.maplibre.android.location.LocationComponentOptions
import org.maplibre.android.location.engine.LocationEngineRequest
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style
import java.io.File

class MapActivity : ComponentActivity() {
    private lateinit var mapView: MapView
    private lateinit var fusedLocationProviderClient: FusedLocationProviderClient
    private val ioScope = CoroutineScope(Dispatchers.IO)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)
        mapView = MapView(this)
        mapView.onCreate(savedInstanceState)

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        val offlineRouting = OfflineRouting(this)
        offlineRouting.initializeGraphHopper()
        val mapViewModel = MapViewModel(
            fusedLocationProviderClient,
            ::areLocationPermissionsGranted,
            ::buildLocationComponentOptions,
            ::buildLocationComponentActivationOptions,
            offlineRouting::getRoute,
        )

        setContent {
            ApplicationTheme {
                MapView(mapView, mapViewModel)
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

    private fun buildLocationComponentOptions() : LocationComponentOptions {
        return LocationComponentOptions.builder(this)
            .pulseEnabled(true)
            .build()
    }

    private fun buildLocationComponentActivationOptions(
        style: Style,
        locationComponentOptions: LocationComponentOptions
    ): LocationComponentActivationOptions {
        return LocationComponentActivationOptions
            .builder(this, style)
            .locationComponentOptions(locationComponentOptions)
            .useDefaultLocationEngine(true)
            .locationEngineRequest(
                LocationEngineRequest.Builder(750)
                    .setFastestInterval(750)
                    .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
                    .build()
            )
            .build()
    }

    override fun onStart() {
        super.onStart()
        mapView.onStart()

        val graphCacheFilesDir = File(filesDir, "graph-cache")
        ioScope.launch {
            copyAssetsToFilesDir(this@MapActivity, "graph-cache", graphCacheFilesDir)
        }
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onStop() {
        super.onStop()
        mapView.onStop()
    }

    override fun onDestroy() {
        super.onDestroy()
        mapView.onDestroy()
    }
}