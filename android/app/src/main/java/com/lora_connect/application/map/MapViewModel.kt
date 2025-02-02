package com.lora_connect.application.map

import android.annotation.SuppressLint
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.graphhopper.ResponsePath
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.current_task.CurrentTask
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
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
    private val currentTaskClass = CurrentTask.instance
    private val _state = MutableStateFlow(MapState())
    val state : StateFlow<MapState> = _state.asStateFlow()
    val currentTask = currentTaskClass.getTask().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, initialValue = null)

    fun setLatLng(latitude: Double, longitude: Double) {
        _state.value = _state.value.copy(
            latitude=latitude,
            longitude=longitude
        )
    }

    private fun setMarkerLatLng(latLng: LatLng) {
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

    fun setNewTask(task: Task) {
        setMarkerLatLng(LatLng(task.latitude!!.toDouble(), task.longitude!!.toDouble()))
        createRoute()
    }

    private fun createRoute() {
        if (_state.value.markerLatLng == null) return
        val best = getRoute(_state.value.latitude, _state.value.longitude, _state.value.markerLatLng!!.latitude, _state.value.markerLatLng!!.longitude)
        _state.value = _state.value.copy(
            path = best
        )
    }
}