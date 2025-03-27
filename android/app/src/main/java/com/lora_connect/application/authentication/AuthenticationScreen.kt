package com.lora_connect.application.authentication

import android.annotation.SuppressLint
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ListItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lora_connect.application.permissions.RequestBluetoothPermission
import com.lora_connect.application.permissions.RequestLocationPermissionUsingRememberLauncherForActivityResult

@RequiresApi(Build.VERSION_CODES.R)
@SuppressLint("MissingPermission")
@Composable
fun AuthenticationScreen(authenticationViewModel: AuthenticationViewModel) {
    val state by authenticationViewModel.state.collectAsState()

    RequestBluetoothPermission(
        onPermissionGranted = { authenticationViewModel.refresh() },
        onPermissionDenied = { authenticationViewModel.permissionDenied() }
    )

    RequestLocationPermissionUsingRememberLauncherForActivityResult(
        onPermissionGranted = {},
        onPermissionDenied = {}
    )

    LaunchedEffect(authenticationViewModel.bluetoothAdapter.isEnabled) {
        authenticationViewModel.setEnabledBluetoothState(authenticationViewModel.bluetoothAdapter.isEnabled)
    }

    Scaffold { innerPadding ->
        if (!state.enabledBluetooth) {
            Box(modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(), contentAlignment = Alignment.Center) {
                Button(onClick ={ authenticationViewModel.enableBluetooth()}) {
                    Text(text = "Enable Bluetooth")
                }
            }
        } else {
            if (state.permissionDenied) {
                Box(modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "Bluetooth Permission Denied")
                }
            } else {
                Column(
                    modifier = Modifier
                        .padding(innerPadding)
                        .padding(24.dp)
                ){
                    Column {
                        Text(text = "Welcome to LoRa-Connect", fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
                        Text(text = "Please connect to a device to continue")
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 32.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ){
                        Text("Discovered Devices")
                        TextButton(onClick = authenticationViewModel::discoverDevices) {
                            Text(text = "Scan Devices")
                        }
                    }
                    if (state.discoveringDevicesLoading) {
                        Box(Modifier.fillMaxSize()){
                            ScanningAnimation()
                        }
                    } else {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            LazyColumn(
                                modifier = Modifier
                                    .padding(top = 10.dp)
                                    .fillMaxSize()
                            ) {
                                item {
                                    if (state.namedDiscoveredDevices.isEmpty()) {
                                        Box(modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(15.dp), contentAlignment = Alignment.Center) {
                                            Text(text = "No Discovered Devices")
                                        }
                                    }
                                }
                                items(state.namedDiscoveredDevices.toList()) {
                                    ListItem(
                                        modifier = Modifier.clickable { authenticationViewModel.connectDevice(it) },
                                        headlineContent = { Text(it.name ?: "Unknown Device") },
                                        supportingContent = { Text(it.address) }
                                    )
                                }
                            }

                            if (state.connectingToDeviceLoading) {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    CircularProgressIndicator()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}