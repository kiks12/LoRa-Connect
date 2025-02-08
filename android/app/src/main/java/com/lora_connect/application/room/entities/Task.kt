package com.lora_connect.application.room.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import java.io.Serializable
import java.util.Date

@Entity
data class Task(
    @PrimaryKey val uid: Int?,
    @ColumnInfo("date") val date: Date,
    @ColumnInfo("ownerId") val ownerId: Int?,
    @ColumnInfo("rescuerId") val rescuerId: Int?,
    @ColumnInfo("numberOfVictims") val numberOfVictims: Int?,
    @ColumnInfo("latitude") val latitude: Float?,
    @ColumnInfo("longitude") val longitude: Float?,
    @ColumnInfo("distance") val distance: Float?,
    @ColumnInfo("evacuationCenterId") val evacuationCenterId: Int?,
    @ColumnInfo("evacuationLatitude") val evacuationLatitude: Float?,
    @ColumnInfo("evacuationLongitude") val evacuationLongitude: Float?,
    @ColumnInfo("taskStatus") val status: TaskStatus?,
    @ColumnInfo("taskUrgency") val urgency: TaskUrgency?,

    // NEW COLUMN VERSION: 2 OF DB
    val notes: String? = null,
) : Serializable
