package com.lora_connect.application.obstacles

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.repositories.ObstacleRepository
import com.lora_connect.application.room.entities.Obstacle
import com.lora_connect.application.utils.ToastHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ObstacleListViewModel(
    application: Application,
    private val toastHelper: ToastHelper,
    val finish: () -> Unit
): ViewModel() {
    private val obstacleRepository = ObstacleRepository(application)
    val obstacles = obstacleRepository.getAllObstacles().asFlow()

    fun deleteObstacle(obstacle: Obstacle) {
        viewModelScope.launch(Dispatchers.IO) {
            val deleteResult = obstacleRepository.deleteObstacle(obstacle)
            withContext(Dispatchers.Main) {
                toastHelper.showToast(if (deleteResult) "Obstacle Deleted Successfully" else "Failed to delete obstacle")
            }
        }
    }
}