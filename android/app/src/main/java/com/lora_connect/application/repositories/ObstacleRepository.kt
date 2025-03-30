package com.lora_connect.application.repositories

import android.content.Context
import androidx.lifecycle.LiveData
import com.lora_connect.application.room.AppDatabase
import com.lora_connect.application.room.entities.Obstacle

class ObstacleRepository(context: Context){
    private val db = AppDatabase.getDatabase(context)
    private val obstacleDao = db.obstacleDao()

    suspend fun createObstacle(obstacle: Obstacle) {
        obstacleDao.insertAll(obstacle)
    }

    fun getAllObstacles() : LiveData<List<Obstacle>> {
        return obstacleDao.getObstacles()
    }

    suspend fun updateObstacle(obstacle: Obstacle) {
        obstacleDao.updateObstacle(obstacle)
    }

    suspend fun deleteObstacle(obstacle: Obstacle) {
        obstacleDao.deleteObstacle(obstacle)
    }
}
