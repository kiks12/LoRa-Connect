package com.lora_connect.application.authentication

import android.Manifest
import android.annotation.SuppressLint
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.lora_connect.application.R
import compose.icons.FeatherIcons
import compose.icons.feathericons.Slash

@RequiresApi(Build.VERSION_CODES.R)
@SuppressLint("MissingPermission")
@Composable
fun AuthenticationScreen(authenticationViewModel: AuthenticationViewModel) {
    val state by authenticationViewModel.state.collectAsState()
    var permission by remember { mutableIntStateOf(0) }

    val bluetoothPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissionsMap ->
        val arePermissionsGranted = permissionsMap.values.all { it }

        if (arePermissionsGranted) authenticationViewModel.refresh()
        else authenticationViewModel.permissionDenied()
        permission = 1
    }

    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {
        permission = 2
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {
        permission = 3
    }

    val systemUiController = rememberSystemUiController()
    val useDarkIcons = true // Makes icons (WiFi, battery, etc.) black

    SideEffect {
        systemUiController.setStatusBarColor(
            color = Color.White,
            darkIcons = useDarkIcons
        )
    }

    LaunchedEffect(permission) {
        when (permission) {
             0 -> {
                 bluetoothPermission.launch(
                     arrayOf(
                         Manifest.permission.BLUETOOTH,
                         Manifest.permission.BLUETOOTH_SCAN,
                         Manifest.permission.BLUETOOTH_CONNECT,
                         Manifest.permission.BLUETOOTH_ADVERTISE,
                         Manifest.permission.BLUETOOTH_ADMIN
                     )
                 )
             }
            1 -> {
                notificationPermissionLauncher.launch(
                    Manifest.permission.POST_NOTIFICATIONS,
                )
            }
            2 -> {
                locationPermissionLauncher.launch(
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    )
                )
            }
        }

    }

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
                    Column(
                        modifier = Modifier.padding(top=24.dp)
                    ){
                        Image(painterResource(R.drawable.logo_single_line), contentDescription = "Logo", modifier = Modifier.width(250.dp))
                        Text(text = "Connect to a device to continue")
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 48.dp),
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
                                        Column(modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(15.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                            Icon(FeatherIcons.Slash, contentDescription = "No", Modifier.size(40.dp))
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