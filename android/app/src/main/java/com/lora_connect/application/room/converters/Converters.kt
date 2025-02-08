package com.lora_connect.application.room.converters

import androidx.room.TypeConverter
import com.lora_connect.application.tasks.TaskStatus
import java.util.Date

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?) : Date? {
        return value?.let { Date(it) }
    }

    @TypeConverter
    fun dateToTimestamp(date: Date?) : Long? {
        return date.let { it?.time }
    }

    @TypeConverter
    fun fromTaskStatus(status: TaskStatus) : String {
        return status.name
    }

    @TypeConverter
    fun toTaskStatus(statusString: String) : TaskStatus {
        return TaskStatus.valueOf(statusString)
    }
}