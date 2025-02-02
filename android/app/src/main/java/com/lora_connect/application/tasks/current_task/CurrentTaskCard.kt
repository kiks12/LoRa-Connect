package com.lora_connect.application.tasks.current_task

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import com.lora_connect.application.ui.theme.ApplicationTheme
import java.util.Date

@Composable
fun CurrentTaskCard(task: Task) {
    Card {
        Column(modifier = Modifier.padding(12.dp)){
            Text("${task.latitude}")
            Text("${task.longitude}")
            Text("${task.distance}km")
        }
    }
}

@Preview
@Composable
fun CurrentTaskCardPreview() {
    val task = Task(1, Date(), 1, 1, 1, 112.12f, 12312.332f, 121.1f, 1, 12.12f,112.32f, TaskStatus.ASSIGNED, TaskUrgency.LOW)

    ApplicationTheme {
        Scaffold { innerPadding ->
            Box(modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()) {
                CurrentTaskCard(task = task)
            }
        }
    }
}

