package com.lora_connect.application.tasks.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lora_connect.application.tasks.Task
import com.lora_connect.application.tasks.TaskItem
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.tasks.TaskUrgency
import com.lora_connect.application.ui.theme.ApplicationTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Tasks List") },
                navigationIcon = {
                    IconButton(onClick = { /*TODO*/ }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Go Back")
                    }
                }
            )
        }
    ){ innerPadding ->
        LazyColumn(
            modifier = Modifier.padding(innerPadding)
        ){
            items(state.severeTasks) {
                Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
                    TaskItem(task = it)
                }
            }
            items(state.moderateTasks) {
                Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
                    TaskItem(task = it)
                }
            }
            items(state.lowTasks) {
                Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
                    TaskItem(task = it)
                }
            }
        }
    }
}

@Preview
@Composable
fun TaskListScreenPreview() {
    val tasks = arrayOf(
        Task(1, 1, 2, 1.121f, 1.221f, 1.21212f, 1, 121.1232f, 21.12312f, TaskStatus.ASSIGNED, TaskUrgency.MODERATE),
        Task(1, 1, 2, 1.121f, 1.221f, 1.21212f, 1, 121.1232f, 21.12312f, TaskStatus.ASSIGNED, TaskUrgency.LOW),
        Task(1, 1, 2, 1.121f, 1.221f, 1.21212f, 1, 121.1232f, 21.12312f, TaskStatus.ASSIGNED, TaskUrgency.MODERATE),
        Task(1, 1, 2, 1.121f, 1.221f, 1.21212f, 1, 121.1232f, 21.12312f, TaskStatus.ASSIGNED, TaskUrgency.SEVERE),
    )

    ApplicationTheme {
        TaskListScreen(TaskListViewModel(tasks.toList()))
    }
}