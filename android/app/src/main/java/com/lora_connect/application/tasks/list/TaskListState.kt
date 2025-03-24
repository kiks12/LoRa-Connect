package com.lora_connect.application.tasks.list

import android.os.Build
import androidx.annotation.RequiresApi
import com.lora_connect.application.room.entities.Task
import java.time.LocalDate

@RequiresApi(Build.VERSION_CODES.O)
data class TaskListState (
    val tasks: List<Task> = emptyList(),
    val severeTasks: List<Task> = emptyList(),
    val moderateTasks: List<Task> = emptyList(),
    val lowTasks: List<Task> = emptyList(),
    val activeStatus: String = "ALL",
    val showDatePicker: Boolean = false,
    val selectedDate: LocalDate = LocalDate.now(),
)
