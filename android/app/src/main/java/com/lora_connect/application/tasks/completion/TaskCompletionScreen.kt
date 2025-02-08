package com.lora_connect.application.tasks.completion

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lora_connect.application.room.entities.Task
import com.lora_connect.application.tasks.TaskItem
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import com.lora_connect.application.ui.theme.ApplicationTheme
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskCompletionScreen(viewModel: TaskCompletionViewModel) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    IconButton(onClick = { viewModel.finish() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Go Back")
                    }
                },
                title = { Text(text = "Update Task") }
            )
        },
        bottomBar = {
            BottomAppBar {
                Button(onClick = viewModel::updateTask, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black
                )) {
                    Text(text = "Okay")
                }
            }
        }
    ){ innerPadding ->
        if (state.task == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = "Task not Found", fontWeight = FontWeight.SemiBold, fontSize = 32.sp)
            }
        } else {
            Column(modifier = Modifier
                .padding(innerPadding)
                .padding(16.dp)){
                TaskItem(task = state.task!!, withStartButton = false)
                Column(
                    modifier = Modifier.padding(top = 18.dp)
                ){
                    Text(text = "New Status")
                    Box {
                        OutlinedCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { },
                            colors = CardDefaults.cardColors(
                                containerColor = Color.White
                            )
                        ){
                            Row(
                                modifier = Modifier
                                    .padding(12.dp)
                                    .fillMaxWidth()
                                    .clickable { viewModel.toggleNewStatusDropdown() },
                                horizontalArrangement = Arrangement.SpaceBetween
                            ){
                                Text(text = "NEW STATUS")
                                Icon(Icons.Default.ArrowDropDown, contentDescription = "Dropdown Icon")
                            }
                        }
                        DropdownMenu(expanded = state.showDropdownMenu, onDismissRequest = viewModel::toggleNewStatusDropdown) {
                            DropdownMenuItem(text = { Text(text = "ASSIGNED") }, onClick = { viewModel.onNewStatusChange(TaskStatus.ASSIGNED) })
                            DropdownMenuItem(text = { Text(text = "PENDING") }, onClick = { viewModel.onNewStatusChange(TaskStatus.PENDING) })
                            DropdownMenuItem(text = { Text(text = "CANCELLED") }, onClick = { viewModel.onNewStatusChange(TaskStatus.CANCELED) })
                            DropdownMenuItem(text = { Text(text = "FAILED") }, onClick = { viewModel.onNewStatusChange(TaskStatus.COMPLETE) })
                            DropdownMenuItem(text = { Text(text = "COMPLETE") }, onClick = { viewModel.onNewStatusChange(TaskStatus.FAILED) })
                        }
                    }
                }
                Column(
                    modifier = Modifier.padding(top = 18.dp)
                ){
                    Text(text = "Notes")
                    Box {
                        OutlinedTextField(
                            value = state.notes,
                            onValueChange = viewModel::onNotesChange,
                            modifier = Modifier
                                .height(100.dp)
                                .background(Color.White)
                                .fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }
        }
    }
}


@Preview
@Composable
fun TaskCompletionScreenPreview() {
    val newTask = Task(2, Date(), 1, 1, 2, 15.157092f, 120.59178f, 1.2f, 1,
                15.16985f, 120.579285f, TaskStatus.ASSIGNED, TaskUrgency.LOW, "")
    ApplicationTheme {
        TaskCompletionScreen(TaskCompletionViewModel(newTask) {})
    }
}