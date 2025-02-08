package com.lora_connect.application.repositories

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import com.lora_connect.application.room.AppDatabase
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import java.util.Date

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
    fun getTasksToday() : LiveData<List<Task>> {
        return taskDao.getTasksToday(Date())
    }

    suspend fun updateTask(task: Task) {
        taskDao.updateTask(task)
    }
}