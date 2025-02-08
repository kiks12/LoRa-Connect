package com.lora_connect.application.tasks.completion

import androidx.lifecycle.ViewModel
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TaskCompletionViewModel(
    task: Task,
    val finish: () -> Unit
) : ViewModel() {
    private val _state = MutableStateFlow(TaskCompletionState(task = task))
    val state : StateFlow<TaskCompletionState> = _state.asStateFlow()

    fun toggleNewStatusDropdown() {
        _state.value = _state.value.copy(showDropdownMenu = !_state.value.showDropdownMenu)
    }

    fun onNotesChange(newVal: String) {
        _state.value = _state.value.copy(notes = newVal)
    }

    fun onNewStatusChange(newStatus: TaskStatus) {
        _state.value = _state.value.copy(newStatus = newStatus)
    }

    fun updateTask() {
        _state.value = _state.value.copy(
            task = _state.value.task?.copy(
                status = _state.value.newStatus,
                notes = _state.value.notes
            )
        )
    }
}