package com.lora_connect.application.tasks

import java.io.Serializable

data class Task(
    val ownerId: Int?,
    val rescuerId: Int?,
    val numberOfVictims: Int,
    val latitude: Float,
    val longitude: Float,
    val distance: Float,
    val evacuationCenterId: Int,
    val evacuationLatitude: Float,
    val evacuationLongitude: Float,
    val status: TaskStatus,
    val urgency: TaskUrgency,
) : Serializable

val TASK_SERIALIZABLE_TAG = "TASK_SERIALIZABLE_TAG"