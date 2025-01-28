package com.lora_connect.application.tasks.list

import androidx.lifecycle.ViewModel
import com.lora_connect.application.tasks.Task
import com.lora_connect.application.tasks.TaskUrgency
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TaskListViewModel(tasks: List<Task>) : ViewModel() {
    private val _state = MutableStateFlow(TaskListState())
    val state : StateFlow<TaskListState> = _state.asStateFlow()

    init {
        _state.value = _state.value.copy(
            lowTasks = tasks.filter { task -> task.urgency === TaskUrgency.LOW },
            moderateTasks = tasks.filter { task -> task.urgency === TaskUrgency.MODERATE},
            severeTasks = tasks.filter { task -> task.urgency === TaskUrgency.SEVERE},
        )
    }
}