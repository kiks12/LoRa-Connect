#pragma once


// Safe macro definitions with validation
#ifndef DEVICE_ADDR
#error "Device address not configured! Check platformio.ini"
#endif

// // Type-safe accessors
// constexpr const char* getDeviceAddress() {
//     return DEVICE_ADDR;
// }

// constexpr int getDeviceType() {
//     return DEVICE_TYPE;
// }

// // UUID accessors
// constexpr const char* getServiceUuid() {
//     return SERVICE_UUID;
// }
// Add similar checks for other required macros if needed