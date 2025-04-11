package com.lora_connect.application.map

import android.annotation.SuppressLint
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.graphhopper.ResponsePath
import com.lora_connect.application.MainActivity
import com.lora_connect.application.obstacles.ObstacleListActivity
import com.lora_connect.application.repositories.ObstacleRepository
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.shared.SharedBluetoothViewModel
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.completion.TaskCompletionActivity
import com.lora_connect.application.tasks.current_task.CurrentTask
import com.lora_connect.application.tasks.list.TaskListActivity
import com.lora_connect.application.utils.ActivityStarterHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.LocationComponentActivationOptions
import org.maplibre.android.location.LocationComponentOptions
import org.maplibre.android.maps.Style
import java.util.Date

class MapViewModel(
    private val fusedLocationProviderClient: FusedLocationProviderClient,
    private val areLocationPermissionGranted: () -> Boolean,
    val buildLocationComponentOptions: () -> LocationComponentOptions,
    val buildLocationComponentActivationOptions: (style: Style, locationComponentOptions: LocationComponentOptions) -> LocationComponentActivationOptions,
    private val getRoute: suspend  (startLatitude: Double, startLongitude: Double, endLatitude: Double, endLongitude: Double) -> ResponsePath?,
    private val activityStarterHelper: ActivityStarterHelper,
    private val taskRepository: TaskRepository,
    private val obstacleRepository: ObstacleRepository,
    private val sharedBluetoothViewModel: SharedBluetoothViewModel,
): ViewModel() {
    private val currentTaskClass = CurrentTask.instance
    private val _state = MutableStateFlow(MapState())
    val state : StateFlow<MapState> = _state.asStateFlow()
    val currentTask = currentTaskClass.getTask().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, initialValue = null)
    val instructions = currentTaskClass.getInstructions().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, initialValue = null)
    val clearPath = currentTaskClass.clear.asFlow().stateIn(viewModelScope, SharingStarted.Lazily, initialValue = false)
    val obstacles = obstacleRepository.getAllObstacles().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, initialValue = emptyList())
    private var locationCallback: com.google.android.gms.location.LocationCallback? = null

    @SuppressLint("MissingPermission")
    fun startLocationUpdates(
        onLocationUpdate: (latitude: Double, longitude: Double) -> Unit
    ) {
        if (!areLocationPermissionGranted()) return

        @Suppress("DEPRECATION") val request = com.google.android.gms.location.LocationRequest
            .create()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .setInterval(1000)
            .setFastestInterval(500)

        // Store callback to remove it later
        locationCallback = object : com.google.android.gms.location.LocationCallback() {
            override fun onLocationResult(result: com.google.android.gms.location.LocationResult) {
                result.lastLocation?.let { location ->
                    onLocationUpdate(location.latitude, location.longitude)
                }
            }
        }

        fusedLocationProviderClient.requestLocationUpdates(
            request,
            locationCallback!!,
            android.os.Looper.getMainLooper()
        )
    }

    fun stopLocationUpdates() {
        locationCallback?.let {
            fusedLocationProviderClient.removeLocationUpdates(it)
            locationCallback = null
        }
    }

    fun setLatLng(latitude: Double, longitude: Double) {
        _state.value = _state.value.copy(
            latitude=latitude,
            longitude=longitude
        )
    }

    fun setMarkerLatLng(latLng: LatLng?) {
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
                    if (currentTask.value != null) {
                        createRoute()
                    }
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

    fun createRoute() {
        if (_state.value.markerLatLng == null) return
        viewModelScope.launch(Dispatchers.IO) {
            val best = getRoute(_state.value.latitude, _state.value.longitude, _state.value.markerLatLng!!.latitude, _state.value.markerLatLng!!.longitude)
            if (best != null) {
                withContext(Dispatchers.Main) {
                    if (best.instructions != null) CurrentTask.instance.setInstructions(best.instructions)
                    _state.value = _state.value.copy(
                        path = best
                    )
                }

                val updatedTask = currentTask.value?.copy(
                    distance = best.distance.toFloat(),
                    eta = best.time.toFloat(),
                )

                updatedTask?.let {
                    taskRepository.updateTask(it)
                }
            }
        }
    }

    fun logout() {
        CurrentTask.instance.setTask(null)
        CurrentTask.instance.setInstructions(null)
        sharedBluetoothViewModel.getService()?.disconnectDevice()
        activityStarterHelper.startActivity(MainActivity::class.java)
    }

    fun startTasksList() {
        activityStarterHelper.startActivity(TaskListActivity::class.java)
    }

    fun startObstaclesList() {
        activityStarterHelper.startActivity(ObstacleListActivity::class.java)
    }

    fun finishTask() {
        activityStarterHelper.startActivity(TaskCompletionActivity::class.java)
    }

    fun cancelTask() {
        val updatedTask = currentTask.value?.copy(
            timeOfArrival = null,
            timeOfCompletion = null,
            status = TaskStatus.CANCELED
        )
        viewModelScope.launch(Dispatchers.IO) {
            updatedTask?.let {
                taskRepository.updateTask(it)
            }

            withContext(Dispatchers.Main) {
                currentTaskClass.setTask(null)
                currentTaskClass.setInstructions(null)
                toggleClearPath()
                toggleShowCancelConfirmationDialog()
            }
        }
    }

    fun toggleShowCancelConfirmationDialog() {
        _state.value = _state.value.copy(
            showCancelConfirmationDialog = !_state.value.showCancelConfirmationDialog
        )
    }

    fun toggleClearPath() {
        currentTaskClass.clear.value = (!currentTaskClass.clear.value!!)
    }

    fun arrivedAtDestination() {
        val updatedTask = currentTask.value?.copy(
            timeOfArrival = Date()
        )
        viewModelScope.launch(Dispatchers.IO) {
            updatedTask?.let {
                taskRepository.updateTask(it)
            }

            withContext(Dispatchers.Main) {
                currentTaskClass.setTask(updatedTask)
            }
        }
    }
}