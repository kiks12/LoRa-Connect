package com.lora_connect.application.map

import android.annotation.SuppressLint
import android.util.Log
import androidx.lifecycle.ViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.graphhopper.ResponsePath
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.LocationComponentActivationOptions
import org.maplibre.android.location.LocationComponentOptions
import org.maplibre.android.maps.Style

class MapViewModel(
    private val fusedLocationProviderClient: FusedLocationProviderClient,
    private val areLocationPermissionGranted: () -> Boolean,
    val buildLocationComponentOptions: () -> LocationComponentOptions,
    val buildLocationComponentActivationOptions: (style: Style, locationComponentOptions: LocationComponentOptions) -> LocationComponentActivationOptions,
    private val getRoute: (startLatitude: Double, startLongitude: Double, endLatitude: Double, endLongitude: Double) -> ResponsePath?
): ViewModel() {
    private val _state = MutableStateFlow(MapState())
    val state : StateFlow<MapState> = _state.asStateFlow()

    fun setLatLng(latitude: Double, longitude: Double) {
        _state.value = _state.value.copy(
            latitude=latitude,
            longitude=longitude
        )
    }

    fun setMarkerLatLng(latLng: LatLng) {
        _state.value = _state.value.copy(
            markerLatLng = latLng
        )
    }

    @SuppressLint("MissingPermission")
    fun getCurrentLocation(
        onGetCurrentLocationSuccess: (Pair<Double, Double>) -> Unit,
        onGetCurrentLocationFailed: (Exception) -> Unit,
        priority: Boolean = true
    ) {
        // Determine the accuracy priority based on the 'priority' parameter
        val accuracy = if (priority) Priority.PRIORITY_HIGH_ACCURACY
        else Priority.PRIORITY_BALANCED_POWER_ACCURACY

        // Check if location permissions are granted
        if (areLocationPermissionGranted()) {
            // Retrieve the current location asynchronously
            fusedLocationProviderClient.getCurrentLocation(
                accuracy, CancellationTokenSource().token,
            ).addOnSuccessListener { location ->
                location?.let {
                    // If location is not null, invoke the success callback with latitude and longitude
                    onGetCurrentLocationSuccess(Pair(it.latitude, it.longitude))
                }
            }.addOnFailureListener { exception ->
                // If an error occurs, invoke the failure callback with the exception
                onGetCurrentLocationFailed(exception)
            }
        }
    }

    fun createRoute() {
        Log.w("MAP VIEW MODEL", _state.value.markerLatLng.toString())
        Log.w("MAP VIEW MODEL", _state.value.latitude.toString())
        Log.w("MAP VIEW MODEL", _state.value.longitude.toString())
        if (_state.value.markerLatLng == null) return
        val best = getRoute(_state.value.latitude, _state.value.longitude, _state.value.markerLatLng!!.latitude, _state.value.markerLatLng!!.longitude)
        Log.w("MAP VIEW MODEL", "PATH: ${best?.points}")
        _state.value = _state.value.copy(
            path = best
        )
    }
}