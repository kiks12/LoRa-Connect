package com.lora_connect.application.tasks.current_task

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lora_connect.application.room.entities.Task
import compose.icons.FeatherIcons
import compose.icons.feathericons.Minus
import compose.icons.feathericons.Plus

@Composable
fun CurrentTaskCard(
    task: Task,
    onFinishButtonClick: () -> Unit,
    onCancelButtonClick: () -> Unit,
    onArrivedButtonClick: () -> Unit,
) {
    var showDetails by remember { mutableStateOf(true) }

    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = Color.White
        )
    ) {
        AnimatedContent(
            targetState = showDetails,
            transitionSpec = {
                (fadeIn() + slideInVertically { it }) togetherWith (fadeOut() + slideOutVertically { it })
            },
            label = "ExpandCollapseAnimation"
        ) { detailsVisible ->
            if (detailsVisible) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Mission ID: ${task.missionId}", fontSize = 12.sp)
                            Text(text = task.dateTime.toString(), fontSize = 12.sp)
                        }
                        IconButton(onClick = { showDetails = false }) {
                            Icon(FeatherIcons.Minus, contentDescription = "Minimize")
                        }
                    }
                    Column {
                        Text(text = "Username", fontSize = 12.sp)
                        Text(text = task.userName ?: "No Username", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Column(
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Status:")
                            Text(text = "${task.status}")
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Urgency: ")
                            Text(text = "${task.urgency}")
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Number of Victims: ")
                            Text(text = "${task.numberOfRescuee}")
                        }
                    }
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 12.dp)
                    ) {
                        Row {
                            OutlinedButton(
                                onClick = onCancelButtonClick,
                                modifier = Modifier
                                    .fillMaxWidth(0.5f)
                                    .padding(end = 2.dp),
                                border = BorderStroke(1.dp, Color.Red)
                            ) {
                                Text(text = "Cancel", color = Color.Red)
                            }
                            FilledTonalButton(
                                onClick = onArrivedButtonClick,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(start = 2.dp),
                                enabled = task.timeOfArrival == null
                            ) {
                                Text(text = "Arrived")
                            }
                        }
                        Button(
                            onClick = onFinishButtonClick,
                            modifier = Modifier.fillMaxWidth(),
                            enabled = task.timeOfArrival != null
                        ) {
                            Text(text = "Complete")
                        }
                    }
                }
            } else {
                Row(
                    modifier = Modifier
                        .padding(12.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Mission Details", fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
                    IconButton(onClick = { showDetails = true }) {
                        Icon(FeatherIcons.Plus, contentDescription = "Show Details")
                    }
                }
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

