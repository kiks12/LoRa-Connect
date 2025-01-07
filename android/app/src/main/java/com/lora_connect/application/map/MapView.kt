package com.lora_connect.application.map

import android.annotation.SuppressLint
import android.net.Uri
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.lora_connect.application.MapStyleManager
import com.lora_connect.application.permissions.RequestLocationPermissionUsingRememberLauncherForActivityResult
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.modes.CameraMode
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style

@SuppressLint("MissingPermission")
@Composable
fun MapView(mapView: MapView, mapViewModel: MapViewModel) {
    val state by mapViewModel.state.collectAsState()

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
            }

            mapView
        },
        modifier = Modifier.fillMaxSize()
    )
}