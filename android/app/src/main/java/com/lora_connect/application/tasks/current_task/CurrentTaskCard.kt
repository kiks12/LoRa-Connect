package com.lora_connect.application.tasks.current_task

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import com.lora_connect.application.ui.theme.ApplicationTheme
import java.util.Date

@Composable
fun CurrentTaskCard(task: Task, onFinishButtonClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = Color.White
        )
    ){
        Column(modifier = Modifier.padding(12.dp)){
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ){
                Text(text = "UID: ${task.uid}", fontSize = 12.sp)
                Text(text = "TIME_HERE", fontSize = 12.sp)
            }
            Text(text = "Status: ${task.status}")
            Text(text = "Urgency: ${task.urgency}")
            Text(text = "Number of Victims: ${task.numberOfVictims}")
            Text("${task.distance}km")
        }
        Button(
            onClick = onFinishButtonClick,
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Black
            )
        ) {
            Text(text = "Finish")
        }
    }
}

@Preview
@Composable
fun CurrentTaskCardPreview() {
    val task = Task(1, Date(), 1, 1, 1, 112.12f, 12312.332f, 121.1f, 1F, 1, 12.12f,112.32f, TaskStatus.ASSIGNED, TaskUrgency.LOW, "")

    ApplicationTheme {
        Scaffold { innerPadding ->
            Box(modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(),
                contentAlignment = Alignment.BottomCenter) {
                Box(modifier = Modifier.padding(12.dp)){
                    CurrentTaskCard(task = task) {

                    }
                }
            }
        }
    }
}

