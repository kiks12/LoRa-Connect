#include <SPI.h>
#include <LoRa.h>

#define FREQUENCY 915E6
#define CS_PIN 10
#define RESET_PIN 9
#define INTERRUPT_PIN 2

void setup() {
  Serial.begin(9600);
  while (!Serial);

  LoRa.setPins(CS_PIN, RESET_PIN, INTERRUPT_PIN);

  Serial.println("LoRa Receiver");

  if (!LoRa.begin(FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
}

void loop() {
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
