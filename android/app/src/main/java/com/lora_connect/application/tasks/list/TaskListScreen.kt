package com.lora_connect.application.tasks.list

import android.os.Build
import androidx.annotation.RequiresApi
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lora_connect.application.tasks.TaskItem
import com.lora_connect.application.ui.theme.ApplicationTheme

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val state by viewModel.state.collectAsState()
    val tasks by viewModel.tasks.collectAsState()

    LaunchedEffect(tasks) {
        viewModel.setTasksBreakdown(tasks)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Tasks List") },
                navigationIcon = {
                    IconButton(onClick = {  }) {
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
                    TaskItem(task = it, onStartButtonClick = { viewModel.onStartButtonClick(it) })
                }
            }
            items(state.moderateTasks) {
                Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
                    TaskItem(task = it, onStartButtonClick = { viewModel.onStartButtonClick(it) })
                }
            }
            items(state.lowTasks) {
                Box(modifier = Modifier.padding(vertical = 8.dp, horizontal = 16.dp)) {
                    TaskItem(task = it, onStartButtonClick = { viewModel.onStartButtonClick(it) })
                }
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Preview
@Composable
fun TaskListScreenPreview() {

    ApplicationTheme {
//        TaskListScreen(TaskListViewModel(application = ))
    }
}