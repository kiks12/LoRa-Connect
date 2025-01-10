package com.lora_connect.application.authentication

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ListItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.lora_connect.application.permissions.RequestBluetoothPermission

@SuppressLint("MissingPermission")
@Composable
fun AuthenticationScreen(authenticationViewModel: AuthenticationViewModel) {
    val state by authenticationViewModel.state.collectAsState()

    RequestBluetoothPermission(
        onPermissionGranted = { authenticationViewModel.refresh() },
        onPermissionDenied = { authenticationViewModel.permissionDenied() }
    )

    Scaffold { innerPadding ->
        if (state.permissionDenied) {
            Box(modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = "Bluetooth Permission Denied")
            }
        } else {
           LazyColumn(
               modifier = Modifier.padding(innerPadding)
           ) {
               item {
                   Text("PAIRED DEVICES")
               }
               items(state.bondedDevices.toList()) {
                   ListItem(headlineContent = { Text(it.name) })
               }
               item {
                   Text("DISCOVERED DEVICES")
               }
               items(state.discoveredDevices.toList()) {
                   ListItem(headlineContent = { Text(it.name) })
               }
               item {
                   Button(onClick = authenticationViewModel::discoverDevices) {
                       Text(text = "Discover Devices")
                   }
               }
           }
        }
    }
}