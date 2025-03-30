package com.lora_connect.application.map

import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.lora_connect.application.repositories.ObstacleRepository
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.shared.SharedBluetoothViewModel
import com.lora_connect.application.ui.theme.ApplicationTheme
import com.lora_connect.application.utils.ActivityStarterHelper
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
    private val taskRepository = TaskRepository(this)
    private val obstacleRepository = ObstacleRepository(this)
    private lateinit var sharedBluetoothViewModel: SharedBluetoothViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)
        mapView = MapView(this)
        mapView.onCreate(savedInstanceState)
        val activityStarterHelper = ActivityStarterHelper(this)

        sharedBluetoothViewModel = ViewModelProvider(this, ViewModelProvider.AndroidViewModelFactory.getInstance(application))[SharedBluetoothViewModel::class.java]

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        val offlineRouting = OfflineRouting(this)
        offlineRouting.initializeGraphHopper()
        val mapViewModel = MapViewModel(
            fusedLocationProviderClient,
            ::areLocationPermissionsGranted,
            ::buildLocationComponentOptions,
            ::buildLocationComponentActivationOptions,
            offlineRouting::getRoute,
            activityStarterHelper,
            taskRepository,
            obstacleRepository,
            sharedBluetoothViewModel
        )

        setContent {
            ApplicationTheme {
                Scaffold { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        MapView(mapView, mapViewModel)
                    }
                }
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

        val graphCacheFilesDir = File(filesDir, "graph-cache-v1")
        ioScope.launch {
            copyAssetsToFilesDir(this@MapActivity, "graph-cache-v1", graphCacheFilesDir)
        }

        sharedBluetoothViewModel.bindService(this)
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