package com.lora_connect.application.obstacles

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import com.lora_connect.application.repositories.ObstacleRepository

class ObstacleListViewModel(application: Application, val finish: () -> Unit): ViewModel() {
    private val obstacleRepository = ObstacleRepository(application)
    val obstacles = obstacleRepository.getAllObstacles().asFlow()
}