
#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;

void setup() {
 Serial.begin(115200);
 SerialBT.begin("ESP32-Rescuer"); //Bluetooth device name
 Serial.println("The device started, now you can pair it with bluetooth!");
}

void loop() {
 if (Serial.available() > 0 ) {
   SerialBT.write(Serial.read());
 }
 delay(20);
}
