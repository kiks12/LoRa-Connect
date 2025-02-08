package com.lora_connect.application.tasks.completion

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lora_connect.application.repositories.TaskRepository
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class TaskCompletionViewModel(
    application: Application,
    task: Task,
    val finish: () -> Unit
) : ViewModel() {
    private val taskRepository = TaskRepository(application)
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
        toggleNewStatusDropdown()
    }

    fun updateTask() {
        _state.value = _state.value.copy(
            task = _state.value.task?.copy(
                status = _state.value.newStatus,
                notes = _state.value.notes
            )
        )
        viewModelScope.launch(Dispatchers.IO) {
            if (_state.value.task != null) {
                taskRepository.updateTask(_state.value.task!!)
            }
            withContext(Dispatchers.Main) {
                finish()
            }
        }
    }
}