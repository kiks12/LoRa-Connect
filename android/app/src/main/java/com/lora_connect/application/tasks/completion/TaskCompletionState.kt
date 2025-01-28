package com.lora_connect.application.tasks.completion

import com.lora_connect.application.tasks.Task
import com.lora_connect.application.tasks.TaskStatus

data class TaskCompletionState(
    val newStatus: TaskStatus = TaskStatus.ASSIGNED,
    val showDropdownMenu: Boolean = false,
    val task: Task? = null,
    val notes: String = ""
)
