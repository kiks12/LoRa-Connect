
// ESP32 CODE for Rescuer Bracelet

#include <SPI.h>
#include <LoRa.h>

// #include "BluetoothSerial.h"

// #if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
// #error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
// #endif

#define sck 18
#define miso 19
#define mosi 23
#define ss 5
#define rst 16
#define dio0 25
#define frequency 433E6

// #define uid "XRSCR001"
// #define bluetoothName "ESP-XRSCR001"
// BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  Serial.println("LoRa Receiver");
  // SerialBT.begin(bluetoothName); //Bluetooth device name
  // Serial.println("The device started, now you can pair it with bluetooth!");
  
  // SPI.begin(sck, miso, mosi, ss);
  LoRa.setPins(ss, rst, dio0);

  while (!Serial);

  if (!LoRa.begin(frequency)) {
    Serial.println("Starting LoRa failed!");
    while(1);
  }

  Serial.println("Starting LoRa successful!");
  LoRa.setSpreadingFactor(7);  // SF7 (Range: 6-12)
  LoRa.setSignalBandwidth(250E3); // 250 kHz (Options: 7.8E3 to 500E3)
  LoRa.setCodingRate4(5);  // 4/5 (Range: 5-8)
  LoRa.setSPIFrequency(1E6); 
}

void loop() {
  Serial.println("Sending Packet...");
  LoRa.beginPacket();  
  LoRa.print("Hello from ESP32");
  LoRa.endPacket();
  Serial.println("Packet Sent");
  delay(2000);

  // try to parse packet
  // int packetSize = LoRa.parsePacket();
  // if (packetSize) {
  //   // received a packet
  //   Serial.print("Received packet '");

  //   // read packet
  //   while (LoRa.available()) {
  //     Serial.print((char)LoRa.read());
  //   }

  //   // print RSSI of packet
  //   Serial.print("' with RSSI ");
  //   Serial.println(LoRa.packetRssi());
  // }
}
