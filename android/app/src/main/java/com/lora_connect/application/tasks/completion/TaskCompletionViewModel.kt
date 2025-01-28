package com.lora_connect.application.tasks.completion

import androidx.lifecycle.ViewModel
import com.lora_connect.application.tasks.Task
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TaskCompletionViewModel(
    task: Task?
) : ViewModel() {
    private val _state = MutableStateFlow(TaskCompletionState(task = task))
    val state : StateFlow<TaskCompletionState> = _state.asStateFlow()

    fun toggleNewStatusDropdown() {
        _state.value = _state.value.copy(showDropdownMenu = !_state.value.showDropdownMenu)
    }

    fun onNotesChange(newVal: String) {
        _state.value = _state.value.copy(notes = newVal)
    }
}