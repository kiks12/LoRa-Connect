package com.lora_connect.application.repositories

import android.content.Context
import androidx.lifecycle.LiveData
import com.lora_connect.application.room.AppDatabase
import com.lora_connect.application.room.entities.Obstacle

class ObstacleRepository(context: Context){
    private val db = AppDatabase.getDatabase(context)
    private val obstacleDao = db.obstacleDao()

    fun createObstacle(obstacle: Obstacle) : Boolean {
        return try {
            obstacleDao.insertAll(obstacle)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getAllObstacles() : LiveData<List<Obstacle>> {
        return obstacleDao.getObstacles()
    }

    fun updateObstacle(obstacle: Obstacle) : Boolean {
        return try {
            obstacleDao.updateObstacle(obstacle)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun deleteObstacle(obstacle: Obstacle) : Boolean {
        return try {
            obstacleDao.deleteObstacle(obstacle)
            true
        } catch (e: Exception) {
            false
        }
    }
}
