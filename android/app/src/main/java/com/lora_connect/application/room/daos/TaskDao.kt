package com.lora_connect.application.room.daos

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.lora_connect.application.room.entities.Task

@Dao
interface TaskDao {
    @Query("SELECT * FROM task")
    fun getTasks() : LiveData<List<Task>>

    @Query("SELECT * FROM task WHERE status=:status")
    fun getTasksWhereStatus(status: String) : LiveData<List<Task>>

    @RequiresApi(Build.VERSION_CODES.O)
    @Query("SELECT * FROM task WHERE dateTime BETWEEN :startOfDay AND :endOfDay")
    fun getTasksWithinDay(startOfDay: Long, endOfDay: Long): LiveData<List<Task>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    fun insertAll(vararg tasks: Task)

    @Delete
    fun delete(task: Task)

    @Update
    fun updateTask(task: Task)

}