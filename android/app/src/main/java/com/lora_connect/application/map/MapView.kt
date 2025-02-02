@file:Suppress("DEPRECATION")

package com.lora_connect.application.map

import android.annotation.SuppressLint
import android.net.Uri
import android.util.Log
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.lora_connect.application.permissions.RequestLocationPermissionUsingRememberLauncherForActivityResult
import com.lora_connect.application.tasks.current_task.CurrentTaskCard
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.annotations.Polyline
import org.maplibre.android.annotations.PolylineOptions
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.modes.CameraMode
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style

@SuppressLint("MissingPermission")
@Composable
fun MapView(mapView: MapView, mapViewModel: MapViewModel) {
    val currentTask by mapViewModel.currentTask.collectAsState()
    val state by mapViewModel.state.collectAsState()
    var polyline by remember {
        mutableStateOf<Polyline?>(null)
    }

    val context = LocalContext.current
    val styleBuilder = remember {
        val styleManager = MapStyleManager(context)
        val style = when (val result = styleManager.setupStyle()) {
            is MapStyleManager.StyleSetupResult.Error -> {
                throw result.exception
            }

            is MapStyleManager.StyleSetupResult.Success -> result.styleFile
        }
        Style.Builder().fromUri(
            Uri.fromFile(style).toString()
        )
    }

    RequestLocationPermissionUsingRememberLauncherForActivityResult(
        onPermissionGranted = {
            mapViewModel.getCurrentLocation(
                onGetCurrentLocationSuccess = {
                    mapViewModel.setLatLng(it.first, it.second)
                },
                onGetCurrentLocationFailed = {
                    it.localizedMessage?.let { it1 -> Log.w("OFFLINE MAP", it1) }
                }
            )
        },
        onPermissionDenied = {
            Log.w("OFFLINE MAP", "PERMISSION DENIED")
        }
    )

    LaunchedEffect(state.markerLatLng) {
        if (state.markerLatLng != null) {
            mapView.getMapAsync {map ->
                map.clear()
                val newMarker : MarkerOptions = MarkerOptions().position(state.markerLatLng)
                map.addMarker(newMarker)
            }
        }
    }

    LaunchedEffect(state.path) {
        if (state.path != null) {
            if (polyline != null) {
                polyline.let {
                    mapView.getMapAsync { map ->
                        map.removeAnnotation(it!!.id)
                    }
                }
            }

            val newPolyline = PolylineOptions().addAll(state.path!!.points.map { LatLng(it.lat, it.lon) }).width(5f)
            mapView.getMapAsync { map ->
                map.addPolyline(newPolyline)
                polyline = newPolyline.polyline
            }
        }
    }

    LaunchedEffect(currentTask) {
        if (currentTask != null) mapViewModel.setNewTask(currentTask!!)
    }

    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
        AndroidView(
            factory = {
                mapView.getMapAsync { map ->
                    map.setStyle(styleBuilder) { style ->
                        val locationComponent = map.locationComponent
                        val locationComponentOptions = mapViewModel.buildLocationComponentOptions()
                        val locationComponentActivationOptions = mapViewModel.buildLocationComponentActivationOptions(style, locationComponentOptions)
                        locationComponent.activateLocationComponent(locationComponentActivationOptions)
                        locationComponent.isLocationComponentEnabled = true
                        locationComponent.cameraMode = CameraMode.TRACKING

                    }
                    map.cameraPosition = org.maplibre.android.camera.CameraPosition.Builder().target(location = LatLng(state.latitude, state.longitude)).zoom(10.0).build()
//                    map.addOnMapClickListener {
//                        mapViewModel.setMarkerLatLng(LatLng(it.latitude, it.longitude))
//                        true
//                    }
                }

                mapView
            },
            modifier = Modifier.fillMaxSize()
        )
        if (currentTask != null) {
            Box(modifier = Modifier.padding(8.dp)) {
                CurrentTaskCard(task = currentTask!!)
            }
        }
    }
}