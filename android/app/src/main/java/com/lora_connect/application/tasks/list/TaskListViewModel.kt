package com.lora_connect.application.tasks.list

import android.app.Application
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn

@RequiresApi(Build.VERSION_CODES.O)
class TaskListViewModel(application: Application) : ViewModel() {
    private val taskRepository = TaskRepository(application)
    private val _state = MutableStateFlow(TaskListState())
    val state : StateFlow<TaskListState> = _state.asStateFlow()
    val tasks = taskRepository.getTasksToday().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    fun setTasksBreakdown(tasks: List<Task>) {
        _state.value = _state.value.copy(
            lowTasks = tasks.filter { it.urgency === TaskUrgency.LOW },
            moderateTasks = tasks.filter { it.urgency === TaskUrgency.MODERATE},
            severeTasks = tasks.filter { it.urgency === TaskUrgency.SEVERE},
        )
    }
}