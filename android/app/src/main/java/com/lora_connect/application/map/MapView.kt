@file:Suppress("DEPRECATION")

package com.lora_connect.application.map

import android.annotation.SuppressLint
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.lora_connect.application.R
import com.lora_connect.application.authentication.BluetoothSessionManager
import com.lora_connect.application.tasks.InstructionItem
import com.lora_connect.application.tasks.current_task.CurrentTaskCard
import compose.icons.FeatherIcons
import compose.icons.feathericons.AlertCircle
import compose.icons.feathericons.List
import compose.icons.feathericons.LogOut
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
    val obstacles by mapViewModel.obstacles.collectAsState()
    val currentTask by mapViewModel.currentTask.collectAsState()
    val instructions by mapViewModel.instructions.collectAsState()
    val clearPath by mapViewModel.clearPath.collectAsState()
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
    var showMenu by remember {
        mutableStateOf(false)
    }

    val systemUiController = rememberSystemUiController()
    val useDarkIcons = true // Makes icons (WiFi, battery, etc.) black

    SideEffect {
        systemUiController.setStatusBarColor(
            color = Color.White,
            darkIcons = useDarkIcons
        )
    }

//    RequestLocationPermissionUsingRememberLauncherForActivityResult(
//        onPermissionGranted = {
//            mapViewModel.getCurrentLocation(
//                onGetCurrentLocationSuccess = {
//                    mapViewModel.setLatLng(it.first, it.second)
//                },
//                onGetCurrentLocationFailed = {
//                    it.localizedMessage?.let { it1 -> Log.w("OFFLINE MAP", it1) }
//                }
//            )
//        },
//        onPermissionDenied = {
//            Log.w("OFFLINE MAP", "PERMISSION DENIED")
//        }
//    )

    LaunchedEffect(state.markerLatLng, obstacles) {
        if (state.markerLatLng != null) {
            mapView.getMapAsync {map ->
                map.clear()
                val newMarker : MarkerOptions = MarkerOptions().position(state.markerLatLng)
                map.addMarker(newMarker)

                obstacles.forEach {
                    if (it.latitude == null || it.longitude == null) return@forEach
                    val newObstacleMarker: MarkerOptions = MarkerOptions().position(LatLng(it.latitude.toDouble(), it.longitude.toDouble()))
                    map.addMarker(newObstacleMarker)
                }
            }
        }
    }

    LaunchedEffect(obstacles) {
        mapViewModel.createRoute()
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

            val newPolyline = PolylineOptions()
                .addAll(state.path!!.points.map { LatLng(it.lat, it.lon) })
                .width(6f)
                .color(android.graphics.Color.argb(255, 50, 122, 237))
            mapView.getMapAsync { map ->
                map.addPolyline(newPolyline)
                polyline = newPolyline.polyline
            }
        }
    }

    LaunchedEffect(currentTask) {
        if (currentTask != null) mapViewModel.setNewTask(currentTask!!)
    }

    LaunchedEffect(clearPath) {
        if (clearPath == true) {
            mapView.getMapAsync { map ->
                map.clear()
                if (polyline != null) {
                    polyline.let {
                        map.removeAnnotation(it!!.id)
                    }
                }
            }
            mapViewModel.toggleClearPath()
            mapViewModel.setMarkerLatLng(null)
        }
    }


    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        Box(modifier = Modifier.fillMaxSize()) {
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
                        map.cameraPosition = org.maplibre.android.camera.CameraPosition.Builder().target(location = LatLng(state.latitude, state.longitude)).zoom(14.0).build()
                    }

                    mapView
                },
                modifier = Modifier.fillMaxSize()
            )
        }
        if (currentTask == null) {
            Box(modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(Color.White, Color.Transparent),
                        startY = 150f, // Starts at the top
                        endY = 350f // Adjust this value for a smoother fade effect
                    )
                )) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ){
                    IconButton(onClick = { mapViewModel.logout() }) {
                        Icon(FeatherIcons.LogOut, contentDescription = "Logout")
                    }
                    Column(
                        modifier = Modifier.padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ){
                        Image(
                            painterResource(R.drawable.logo_single_line),
                            contentDescription = "LOGO",
                            modifier = Modifier.width(150.dp)
                        )
                        if (BluetoothSessionManager.bluetoothDevice != null) {
                            BluetoothButton()
                        }
                    }
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                        }
                        DropdownMenu(expanded = showMenu, onDismissRequest = { showMenu = false }) {
                            DropdownMenuItem(
                                leadingIcon = { Icon(FeatherIcons.List, "Task List") },
                                text = { Text("Tasks") },
                                onClick = mapViewModel::startTasksList
                            )
                            DropdownMenuItem(
                                leadingIcon = { Icon(FeatherIcons.AlertCircle, "Obstacles") },
                                text = { Text("Obstacles") },
                                onClick = mapViewModel::startObstaclesList
                            )
//                            DropdownMenuItem(
//                                leadingIcon = { Icon(FeatherIcons.LogOut, "Logout") },
//                                text = { Text("Logout") },
//                                onClick = mapViewModel::logout
//                            )
                        }
                    }
                }
            }
        }

        if (currentTask != null) {
            Box(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.SpaceBetween,
                ){
                    Box(modifier = Modifier
                        .padding(8.dp)
                        .fillMaxWidth()) {
                        if (instructions != null) {
                            InstructionItem(instruction = instructions!![0], onMenuClick = mapViewModel::startTasksList)
                        }
                    }
                    Box(modifier = Modifier.padding(8.dp)) {
                        CurrentTaskCard(
                            task = currentTask!!,
                            onFinishButtonClick = { mapViewModel.finishTask() },
                            onCancelButtonClick = { mapViewModel.toggleShowCancelConfirmationDialog() },
                            onArrivedButtonClick = { mapViewModel.arrivedAtDestination() }
                        )
                    }
                }
            }
        }
        if (state.showCancelConfirmationDialog) {
            ConfirmationDialog(
                onDismissRequest = mapViewModel::toggleShowCancelConfirmationDialog,
                onConfirmation = mapViewModel::cancelTask,
                dialogTitle = "Cancel Mission",
                dialogText = "Are you sure you want to cancel this mission?"
            )
        }
    }
}