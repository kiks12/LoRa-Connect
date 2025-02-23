
#include <SPI.h>
#include <LoRa.h> 
String inString = "";    // string to hold input
int val = 0;

#define frequency 433E6
 
void setup() {
  Serial.begin(9600);

  SPI.begin();
  LoRa.setPins(10, 9, 2);
  
  while (!Serial);
  
  if (!LoRa.begin(frequency)) { // or 915E6
    Serial.println("LoRa initialization failed!");
    while (1);
  }

  Serial.println("LoRa initialized successfully!");
  LoRa.setSpreadingFactor(7);  // SF7 (Range: 6-12)
  LoRa.setSignalBandwidth(250E3); // 250 kHz (Options: 7.8E3 to 500E3)
  LoRa.setCodingRate4(5);  // 4/5 (Range: 5-8)
  LoRa.setSPIFrequency(1E6); 
}
 
void loop() {
  Serial.println("Sending Packet...");
  LoRa.beginPacket();  
  LoRa.print("[UID][CODE][PIECE NO.][DATA][ENDCODE]");
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
