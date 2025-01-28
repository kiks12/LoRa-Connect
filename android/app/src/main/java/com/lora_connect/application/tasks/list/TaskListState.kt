package com.lora_connect.application.tasks.list

import com.lora_connect.application.tasks.Task

data class TaskListState(
    val severeTasks: List<Task> = emptyList(),
    val moderateTasks: List<Task> = emptyList(),
    val lowTasks: List<Task> = emptyList()
)
