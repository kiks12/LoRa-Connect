package com.lora_connect.application.map

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.lora_connect.application.services.BluetoothDataService
import com.lora_connect.application.tasks.list.TaskListActivity
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

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)
        mapView = MapView(this)
        mapView.onCreate(savedInstanceState)
        val activityStarterHelper = ActivityStarterHelper(this)

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        val offlineRouting = OfflineRouting(this)
        offlineRouting.initializeGraphHopper()
        val mapViewModel = MapViewModel(
            fusedLocationProviderClient,
            ::areLocationPermissionsGranted,
            ::buildLocationComponentOptions,
            ::buildLocationComponentActivationOptions,
            offlineRouting::getRoute,
            activityStarterHelper
        )

        setContent {
            ApplicationTheme {
                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {  },
                            navigationIcon = {
                                IconButton(onClick = { /*TODO*/ }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Go Back")
                                }
                            },
                            actions = {
                                TextButton(onClick = ::startTasksList) {
                                    Text(text = "Tasks")
                                }
                            }
                        )
                    }
                ){ innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        MapView(mapView, mapViewModel)
                    }
                }
            }
        }

        // ONLY UNCOMMENT IF AUTHENTICATION IS RUNNING
         startBluetoothDataService()
    }

    private fun startBluetoothDataService() {
        val intent = Intent(this, BluetoothDataService::class.java).apply {
            putExtra("DEVICE_ADDRESS", intent.getStringExtra("DEVICE_ADDRESS"))
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun startTasksList() {
        val intent = Intent(this, TaskListActivity::class.java)
        startActivity(intent)
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