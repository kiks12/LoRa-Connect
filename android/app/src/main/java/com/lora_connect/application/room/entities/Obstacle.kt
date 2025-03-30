package com.lora_connect.application.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Obstacle(
    @PrimaryKey val obstacleId: Int,
    val name: String? = null,
    val type: String? = null,
    val latitude: Float? = null,
    val longitude: Float? = null,
)
