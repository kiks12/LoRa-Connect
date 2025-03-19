package com.lora_connect.application.tasks.list

import android.app.Application
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asFlow
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.current_task.CurrentTask
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@RequiresApi(Build.VERSION_CODES.O)
class TaskListViewModel(application: Application, val finish: () -> Unit) : ViewModel() {
    private val currentTask = CurrentTask.instance
    private val taskRepository = TaskRepository(application)
    private val _state = MutableStateFlow(TaskListState())
    val state : StateFlow<TaskListState> = _state.asStateFlow()
    val tasks = taskRepository.getTasksToday().asFlow().stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    fun setTasksBreakdown(tasks: List<Task>) {
        _state.value = _state.value.copy(
            lowTasks = tasks.filter { it.urgency === TaskUrgency.LOW && ((_state.value.activeStatus !== "ALL" && it.status === TaskStatus.valueOf(_state.value.activeStatus)) || _state.value.activeStatus === "ALL")},
            moderateTasks = tasks.filter { it.urgency === TaskUrgency.MODERATE && ((_state.value.activeStatus !== "ALL" && it.status === TaskStatus.valueOf(_state.value.activeStatus)) || _state.value.activeStatus === "ALL")},
            severeTasks = tasks.filter { it.urgency === TaskUrgency.SEVERE && ((_state.value.activeStatus !== "ALL" && it.status === TaskStatus.valueOf(_state.value.activeStatus)) || _state.value.activeStatus === "ALL")},
        )
    }

    fun onStartButtonClick(task: Task) {
        val updatedTask = task.copy(status = TaskStatus.PENDING)
        viewModelScope.launch(Dispatchers.IO) {
            taskRepository.updateTask(updatedTask)
        }
        currentTask.setTask(updatedTask)
        finish()
    }

    fun changeActiveStatus(newStatus: String) {
        _state.value = _state.value.copy(
            activeStatus = newStatus
        )
    }
}