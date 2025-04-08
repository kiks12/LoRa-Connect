# Test Scripts
This folder contains the scripts used for testing the device's various hardware

## GPS
The device uses an ATGM336H GPS module. Two tests were performed, TTFF and Accuracy

### Time-to-First-Fix

### Accuracy

## LoRa
The device uses built-in LoRa SX1262 by Semtech. Range test was performed.

### Range

## Battery Life
The device uses a 3.7V 7.4WH 2000MAH LiPo Battery. Battery life test was performed with following device states:
* **User**: Constant location transmission with OLED display on
* **Rescuer**: Constant location and task update transmission, with Bluetooth forwarding and OLED display on

Both devices are constantly running LoRa receiver when not transmitting, and performing operations on arrays for custom networking protocol
