package com.lora_connect.application.tasks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.graphhopper.util.Instruction
import kotlin.math.roundToLong

@Composable
fun InstructionItem(instruction: Instruction, onMenuClick: () -> Unit) {
    Card(modifier = Modifier
        .fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ){
        Row (
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ){
            Column(
                modifier = Modifier.padding(16.dp)
            ){
                Text(text = "Instructions", fontSize = 14.sp)
                Text(text = instruction.name, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
                Row {
                    Text(text = "${instruction.distance.roundToLong()} m")
                    Text(modifier = Modifier.padding(start=16.dp), text = "${instruction.time / 1000} s")
                }
            }

            FilledTonalIconButton(onClick = onMenuClick, modifier = Modifier.padding(end=16.dp)) {
                Icon(Icons.Default.Menu, contentDescription = "Menu")
            }
        }
    }
}
