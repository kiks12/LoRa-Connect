package com.lora_connect.application.tasks.current_task

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.lora_connect.application.room.entities.Task


class CurrentTask private constructor() {
    private var currentTask : MutableLiveData<Task?> = MutableLiveData(null)
    companion object  {
        val instance = CurrentTask()
    }

    fun setTask(task: Task) {
        currentTask.value = task
    }

    fun getTask() : LiveData<Task?>{
        return currentTask
    }
}