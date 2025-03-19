package com.lora_connect.application.map

import com.graphhopper.ResponsePath
import org.maplibre.android.geometry.LatLng

data class MapState(
    val latitude: Double = 15.0794,
    val longitude: Double = 120.6200,
    val markerLatLng: LatLng? = null,
    val path: ResponsePath? = null,
    val clearPath: Boolean = false,
    val showCancelConfirmationDialog: Boolean = false,
)
