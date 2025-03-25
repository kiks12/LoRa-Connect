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
    @PrimaryKey val missionId: String,
    @ColumnInfo("createdAt") val createdAt: Date,
    @ColumnInfo("dateTime") val dateTime: Date,
    @ColumnInfo("userId") val userId: String?,
    @ColumnInfo("userName") val userName: String?,
    @ColumnInfo("numberOfRescuee") val numberOfRescuee: Int?,
    @ColumnInfo("status") val status: TaskStatus?,
    @ColumnInfo("latitude") val latitude: Float?,
    @ColumnInfo("longitude") val longitude: Float?,
    @ColumnInfo("urgency") val urgency: TaskUrgency?,
    @ColumnInfo("teamId") val teamId: Int?,
    @ColumnInfo("distance") val distance: Float?,
    @ColumnInfo("eta") val eta: Float? = null,
    @ColumnInfo("timeOfArrival") val timeOfArrival : Date? = null,
    @ColumnInfo("timeOfCompletion") val timeOfCompletion: Date? = null,

    // NEW COLUMN VERSION: 2 OF DB
    val notes: String? = null,
) : Serializable
