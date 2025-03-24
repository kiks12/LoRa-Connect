package com.lora_connect.application.repositories

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import com.lora_connect.application.room.AppDatabase
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

class TaskRepository(context: Context){
    private val db = AppDatabase.getDatabase(context)
    private val taskDao = db.taskDao()

    suspend fun createTask(task: Task) {
        taskDao.insertAll(task)
    }

    fun getAllTasks() : LiveData<List<Task>> {
        return taskDao.getTasks()
    }

    fun getAssignedTasks() : LiveData<List<Task>> {
        return taskDao.getTasksWhereStatus(TaskStatus.ASSIGNED.name)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun getTasksWithinDate(date: LocalDate) : LiveData<List<Task>> {
        val startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        val endOfDay = date.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()

        return taskDao.getTasksWithinDay(startOfDay, endOfDay)
    }

    suspend fun updateTask(task: Task) {
        taskDao.updateTask(task)
    }
}