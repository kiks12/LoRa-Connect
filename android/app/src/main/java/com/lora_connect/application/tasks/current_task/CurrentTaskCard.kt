package com.lora_connect.application.tasks.current_task

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lora_connect.application.room.entities.Task

@Composable
fun CurrentTaskCard(task: Task, onFinishButtonClick: () -> Unit, onCancelButtonClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = Color.White
        )
    ){
        Column(modifier = Modifier.padding(12.dp)){
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ){
                Text(text = "Mission ID: ${task.missionId}", fontSize = 12.sp)
                Text(text = task.dateTime.toString(), fontSize = 12.sp)
            }
            Text(text = "Status: ${task.status}")
            Text(text = "Urgency: ${task.urgency}")
            Text(text = "Number of Victims: ${task.numberOfRescuee}")
            Text("${task.distance}km")
        }
        Column(
            modifier = Modifier.fillMaxWidth()
        ){
            Button(
                onClick = onFinishButtonClick,
                modifier = Modifier
                    .padding(top = 12.dp, start = 12.dp, end = 12.dp, bottom = 2.dp)
                    .fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black
                )
            ) {
                Text(text = "Finish")
            }
            TextButton(
                onClick = onCancelButtonClick,
                modifier = Modifier
                    .padding(start = 12.dp, end = 12.dp, bottom = 12.dp)
                    .fillMaxWidth()
            ) {
                Text(text = "Cancel", color = Color.Red)
            }
        }
    }
}

//@Preview
//@Composable
//fun CurrentTaskCardPreview() {
//    val task = Task(1, Date(), 1, 1, 1, 112.12f, 12312.332f, 121.1f, 1F, 1, 12.12f,112.32f, TaskStatus.ASSIGNED, TaskUrgency.LOW, "")
//
//    ApplicationTheme {
//        Scaffold { innerPadding ->
//            Box(modifier = Modifier
//                .padding(innerPadding)
//                .fillMaxSize(),
//                contentAlignment = Alignment.BottomCenter) {
//                Box(modifier = Modifier.padding(12.dp)){
//                    CurrentTaskCard(task = task) {
//
//                    }
//                }
//            }
//        }
//    }
//}

