package com.lora_connect.application.room.daos

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.lora_connect.application.room.entities.Task
import java.util.Date

@Dao
interface TaskDao {
    @Query("SELECT * FROM task")
    fun getTasks() : List<Task>

    @RequiresApi(Build.VERSION_CODES.O)
    @Query("SELECT * FROM task WHERE date=:date")
    fun getTasksToday(date: Date) : List<Task>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    fun insertAll(vararg tasks: Task)

    @Delete
    fun delete(task: Task)

    @Update
    fun updateTask(task: Task)

}