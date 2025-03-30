package com.lora_connect.application.obstacles

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import compose.icons.FeatherIcons
import compose.icons.feathericons.MoreVertical

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ObstacleListScreen(viewModel: ObstacleListViewModel) {
    val obstacles by viewModel.obstacles.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                     IconButton(onClick = { viewModel.finish() }) {
                         Icon(Icons.Default.ArrowBack, "Go Back")
                     }
                },
                title = { Text("Obstacles") }
            )
        }
    ){ innerPadding ->
        LazyColumn(
            modifier = Modifier.padding(innerPadding)
        ){
            items(obstacles) { obstacle ->
                var showDeleteDialog by remember { mutableStateOf(false) }
                var showDropdown by remember { mutableStateOf(false) }

                ListItem(
                    leadingContent = { Text(obstacle.obstacleId.toString()) },
                    headlineContent = { obstacle.name?.let { Text(it) } },
                    supportingContent = { obstacle.type?.let { Text(it) } },
                    trailingContent = {
                        Box {
                            IconButton(onClick = { showDropdown = true }) {
                                Icon(FeatherIcons.MoreVertical, contentDescription = "More")
                            }
                            DropdownMenu(expanded = showDropdown, onDismissRequest = { showDropdown = false }) {
                                DropdownMenuItem(text = { Text("Delete") }, onClick = { showDeleteDialog = true })
                            }
                        }
                    }
                )

                if (showDeleteDialog) {
                    AlertDialog(
                        title = { Text(text = "Delete Confirmation") },
                        text = { Text(text = "Are you sure you want to delete this obstacle?") },
                        onDismissRequest = { showDeleteDialog = false },
                        confirmButton = {
                            Button(onClick = {
                                viewModel.deleteObstacle(obstacle)
                                showDeleteDialog = false
                            }) {
                                Text("Confirm")
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showDeleteDialog = false }) {
                                Text("Cancel")
                            }
                        }
                    )
                }
            }
        }
    }
}