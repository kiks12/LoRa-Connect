package com.lora_connect.application.tasks.list

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lora_connect.application.tasks.TaskItem
import com.lora_connect.application.tasks.TaskStatus
import com.lora_connect.application.ui.theme.ApplicationTheme
import compose.icons.FeatherIcons
import compose.icons.feathericons.Calendar
import java.time.ZoneId
import java.util.Date

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(state.selectedDate) {
        viewModel.setTasks()
    }

    LaunchedEffect(state.tasks, state.activeStatus) {
        viewModel.setTasksBreakdown(state.tasks)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Tasks List") },
                navigationIcon = {
                    IconButton(onClick = { viewModel.finish() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Go Back")
                    }
                },
                actions = {
                    Text(text = state.selectedDate.toString())
                    IconButton(onClick = viewModel::toggleShowDatePicker) {
                        Icon(FeatherIcons.Calendar, contentDescription = "Date Picker")
                    }
                }
            )
        }
    ){ innerPadding ->
        LazyColumn(
            modifier = Modifier.padding(innerPadding)
        ){
            item {
                LazyRow {
                    item {
                        if (state.activeStatus == "ALL") {
                            FilledTonalButton(onClick = { viewModel.changeActiveStatus("ALL") }, modifier = Modifier.padding(horizontal = 5.dp)) {
                                Text(text = "ALL")
                            }
                        } else {
                            TextButton(onClick = { viewModel.changeActiveStatus("ALL") }, modifier = Modifier.padding(horizontal = 5.dp)) {
                                Text(text = "ALL")
                            }
                        }
                    }
                    items(TaskStatus.entries.toTypedArray()) {
                        if (state.activeStatus == it.name) {
                            FilledTonalButton(onClick = { viewModel.changeActiveStatus(it.name)}, modifier = Modifier.padding(horizontal = 5.dp)) {
                                Text(text = it.name)
                            }
                        } else {
                            TextButton(onClick = { viewModel.changeActiveStatus(it.name)}, modifier = Modifier.padding(horizontal = 5.dp)) {
                                Text(text = it.name)
                            }
                        }
                    }
                }
            }
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
        if (state.showDatePicker) {
            DatePickerModal(
                onDateSelected = { dateInMillis ->
                    dateInMillis?.let {
                        viewModel.changeSelectedDate(Date(it).toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                    }
                },
                onDismiss = viewModel::toggleShowDatePicker
            )
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