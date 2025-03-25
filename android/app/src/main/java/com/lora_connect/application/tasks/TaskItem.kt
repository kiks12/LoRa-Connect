package com.lora_connect.application.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.pow
import kotlin.math.roundToInt
import com.lora_connect.application.room.entities.Task

fun Float.roundTo(numFractionDigits: Int): Double {
    val factor = 10.0.pow(numFractionDigits.toDouble())
    return (this * factor).roundToInt() / factor
}

val URGENCY_COLOR_MAP = mapOf(
    TaskUrgency.LOW to Color(228, 190, 0, 255),
    TaskUrgency.MODERATE to Color(228, 106, 0, 255),
    TaskUrgency.SEVERE to Color(196, 0, 0, 255),
)

@Composable
fun TaskItem(task: Task, onStartButtonClick: () -> Unit = {}, withStartButton: Boolean = true) {
    var showMore by remember {
        mutableStateOf(false)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth(),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        ),
        colors = CardDefaults.cardColors(
            containerColor = Color.White,
        )
    ){
        Column(modifier = Modifier.padding(20.dp)){
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ){
                Column {
                    Text(text = "Status", fontSize = 14.sp)
                    Text(text = "${task.status}", fontWeight = FontWeight.SemiBold)
                }
                Column(
                    horizontalAlignment = Alignment.End
                ){
                    Text(text = "Urgency", fontSize = 14.sp)
                    Row (
                        verticalAlignment = Alignment.CenterVertically
                    ){
                        Box(modifier = Modifier
                            .size(20.dp, 12.dp)
                            .clip(CircleShape)
                            .background(
                                URGENCY_COLOR_MAP[task.urgency]!!
                            ))
                        Text(
                            modifier = Modifier.padding(start = 10.dp),
                            fontWeight = FontWeight.SemiBold,
                            text = "${task.urgency}"
                        )
                    }
                }
            }
            Row(
                horizontalArrangement = Arrangement.SpaceBetween ,
                modifier = Modifier.fillMaxWidth()
            ){
                Text(text = "No. of Rescuee:")
                Text(text = "${task.numberOfRescuee}")
            }
            Column(
                modifier = Modifier.padding(top = 18.dp)
            ){
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween ,
                    modifier = Modifier.fillMaxWidth()
                ){
                    Text(text = "User Name:")
                    Text(text = "${task.userName}")
                }

                if (showMore) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween ,
                        modifier = Modifier.fillMaxWidth()
                    ){
                        Text(text = "Latitude:")
                        Text(text = "${task.latitude}")
                    }
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween ,
                        modifier = Modifier.fillMaxWidth()
                    ){
                        Text(text = "Longitude:")
                        Text(text = "${task.longitude}")
                    }
                    if (task.distance != null) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ){
                            Text(text = "Distance:")
                            Text(text = "${task.distance.roundTo(2)}km")
                        }
                    }
                    if (task.eta != null) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ){
                            Text(text = "ETA:")
                            Text(text = "${task.eta.roundTo(2)} seconds")
                        }
                    }
                    if (task.timeOfArrival != null) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ){
                            Text(text = "Time of Arrival:")
                            Text(text = task.timeOfArrival.toLocaleString() ?: "")
                        }
                    }
                    if (task.timeOfCompletion != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ){
                            Text(text = "Time of Completion:")
                            Text(text = task.timeOfCompletion.toLocaleString() ?: "")
                        }
                    }
                    if (task.notes != null) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                        ){
                            Text(text = "Notes:")
                            Text(text = task.notes)
                        }
                    }
                }
            }
            Row (
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp)
            ){
                TextButton(onClick = { showMore = !showMore }, modifier = Modifier.padding(end = 12.dp)) {
                    Text(text = if (showMore) "Less Details" else "More Details")
                }
                if (withStartButton) {
                    Button(onClick = onStartButtonClick) {
                        Text(text = "Start Mission", modifier = Modifier.padding(horizontal = 20.dp))
                    }
                }
            }
        }
    }
}

//@Preview(name = "TaskItemPreview")
//@Composable
//fun TaskItemPreview() {
//
//    val tasks = arrayOf(
//        Task(
//            1,
//            Date(),
//            2,
//            1,
//            1,
//            1.221f,
//            1.21212f,
//            1.2f,
//            2F,
//            2,
//            21.12312f,
//            212.123f,
//            TaskStatus.ASSIGNED,
//            TaskUrgency.MODERATE,
//            "",
//        ),
//    )
//
//    val severeTasks = tasks.filter { task -> task.urgency === TaskUrgency.SEVERE }
//    val moderateTasks = tasks.filter { task -> task.urgency === TaskUrgency.MODERATE}
//    val lowTasks = tasks.filter { task -> task.urgency === TaskUrgency.LOW}
//
//    ApplicationTheme {
//        Scaffold { innerPadding ->
//            LazyColumn(
//                modifier = Modifier
//                    .padding(innerPadding)
//                    .fillMaxSize()
//            ){
//                items(severeTasks) {
//                    Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
//                        TaskItem(task = it)
//                    }
//                }
//                items(moderateTasks) {
//                    Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
//                        TaskItem(task = it)
//                    }
//                }
//                items(lowTasks) {
//                    Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
//                        TaskItem(task = it)
//                    }
//                }
//            }
//        }
//    }
//}