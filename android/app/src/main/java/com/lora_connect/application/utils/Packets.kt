package com.lora_connect.application.utils

import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus

fun createTaskStartAcknowledgementPacket(task: Task) : String {
    val source = task.teamId ?: "1100"
    val destination = task.userId ?: "0001"
    val distance = task.distance ?: 0
    val packet = "${source}${destination}${PacketIdManager.getPacketId()}A2${distance}"
    PacketIdManager.setPacketId(PacketIdManager.getPacketId() + 1)
    return packet
}

fun createTaskStatusUpdatePacket(task: Task) : String {
    val source = task.teamId ?: "1100"
    val destination = "1004"
    val missionId = task.missionId
    val status = when(task.status) {
        null -> 0
        TaskStatus.ASSIGNED -> 1
        TaskStatus.PENDING -> 2
        TaskStatus.CANCELED -> 3
        TaskStatus.FAILED -> 4
        TaskStatus.COMPLETE -> 5
    }
    val packet = "${source}${destination}${PacketIdManager.getPacketId()}52${missionId}-${status}"
    PacketIdManager.setPacketId(PacketIdManager.getPacketId() + 1)
    return packet
}