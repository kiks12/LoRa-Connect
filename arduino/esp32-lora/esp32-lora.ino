
// ESP32 CODE for Rescuer Bracelet

#include <SPI.h>
#include <LoRa.h>
#include <HardwareSerial.h>
#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

#define LORA_SCK 18
#define LORA_MISO 19
#define LORA_MOSI 23
#define LORA_NSS 5
#define LORA_RST 16
#define LORA_DIO0 25
#define LORA_FREQUENCY 433E6

#define GPS_TX 17
#define GPS_RX 4
#define GPS_BAUD 9600

// #define uid "XRSCR001"
// #define bluetoothName "ESP-XRSCR001"
// BluetoothSerial SerialBT;

// TinyGPSPlus gps;
HardwareSerial neoGps(1);

volatile bool packetReceived = false;
String receivedData = "";

void IRAM_ATTR onPacketReceived() {
  packetReceived = true;
}

void setup() {
  Serial.begin(115200);
  Serial.println("LoRa Receiver");

  // BLUETOOTH
  // SerialBT.begin(bluetoothName); //Bluetooth device name
  // Serial.println("The device started, now you can pair it with bluetooth!");

  // LORA INITIALIZATION
  // SPI.begin(sck, miso, mosi, ss);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);

  while (!Serial);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while(1);
  }

  Serial.println("Starting LoRa successful!");
  LoRa.setSpreadingFactor(7);  // SF7 (Range: 6-12)
  LoRa.setSignalBandwidth(250E3); // 250 kHz (Options: 7.8E3 to 500E3)
  LoRa.setCodingRate4(5);  // 4/5 (Range: 5-8)
  LoRa.setSPIFrequency(1E6); 

  // SETUP DIO interrupt
  pinMode(LORA_DIO0, INPUT);
  attachInterrupt(digitalPinToInterrupt(LORA_DIO0), onPacketReceived, RISING);

  // GPS INITIALIZATION
  neoGps.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("GPS Initialized");
}

void loop() {
  while (neoGps.available()) {
    char c = neoGps.read();
    Serial.write(c);  // Debug: Print raw GPS data
  }

  if (packetReceived) {
    packetReceived = false;
    handleLoRaPacket();
  }

  LoRa.beginPacket();
  LoRa.print("Hello from ESP32");
  LoRa.endPacket();
  Serial.println("Packet Sent");
  delay(2000);

  // try to parse packet
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // received a packet
    Serial.print("Received packet '");

    // read packet
    while (LoRa.available()) {
      Serial.print((char)LoRa.read());
    }

    // print RSSI of packet
    Serial.print("' with RSSI ");
    Serial.println(LoRa.packetRssi());
  }

}

void handleLoRaPacket() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    receivedData = "";  // Clear previous data
    Serial.print("Received packet: '");
    
    while (LoRa.available()) {
      char c = (char)LoRa.read();
      receivedData += c;  // Store received data
      Serial.print(c);
    }

    Serial.print("' with RSSI ");
    Serial.println(LoRa.packetRssi());
  }
}

// [uid][code]

// void displayInfo() {
//   Serial.print(F("Location: ")); 
//   if (gps.location.isValid()) {
//     Serial.print(gps.location.lat(), 6);
//     Serial.print(F(","));
//     Serial.print(gps.location.lng(), 6);
//   } else {
//     Serial.print(F("INVALID"));
//   }
 
//  Serial.println();
// }
