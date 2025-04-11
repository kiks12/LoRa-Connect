package com.lora_connect.application.utils

import androidx.compose.runtime.mutableIntStateOf

object PacketIdManager {
    private val packetId = mutableIntStateOf(50)

    fun setPacketId(newId: Int) {
        packetId.intValue = newId
        if (packetId.intValue == 99) packetId.intValue = 50
    }

    fun getPacketId(): Int {
        return packetId.intValue
    }
}