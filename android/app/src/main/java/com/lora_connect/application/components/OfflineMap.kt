package com.lora_connect.application.components

import android.net.Uri
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.lora_connect.application.MapStyleManager
import com.lora_connect.application.map.MapViewModel
import com.lora_connect.application.permissions.RequestLocationPermissionUsingRememberLauncherForActivityResult
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.Style
import org.ramani.compose.CameraPosition
import org.ramani.compose.MapLibre

@Composable
fun OfflineMap(
    mapViewModel: MapViewModel,
    modifier : Modifier = Modifier
) {
    val context = LocalContext.current
    val state by mapViewModel.state.collectAsState()

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

    val cameraPosition = rememberSaveable {
        CameraPosition(
            target = LatLng(state.latitude, state.longitude),
            zoom = 9.0,
        )
    }

    LaunchedEffect(state.latitude, state.longitude) {
        cameraPosition.target = LatLng(latitude = state.latitude, longitude = state.longitude)
    }

    RequestLocationPermissionUsingRememberLauncherForActivityResult(
        onPermissionGranted = {
            mapViewModel.getCurrentLocation(
                onGetCurrentLocationSuccess = {
                    Log.w("OFFLINE MAP", it.toString())
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

    MapLibre(
        modifier = modifier,
        styleBuilder = styleBuilder,
        cameraPosition = cameraPosition
    ) {
        // Add map markers, polylines, etc.
    }
}