package com.lora_connect.application.room.daos

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.lora_connect.application.room.entities.Obstacle

@Dao
interface ObstacleDao {
    @Query("SELECT * FROM Obstacle")
    fun getObstacles() : LiveData<List<Obstacle>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    fun insertAll(vararg obstacle: Obstacle)

    @Delete
    fun deleteObstacle(obstacle: Obstacle)

    @Update
    fun updateObstacle(obstacle: Obstacle)
}