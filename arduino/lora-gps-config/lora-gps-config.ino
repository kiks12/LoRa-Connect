//#include <TinyGPSPlus.h>
//#include <SoftwareSerial.h>
//
//static const int RXPin = 16, TXPin = 17;
//static const uint32_t GPSBaud = 9600;
//#define SCL 22
//#define SDA 21
//
//#define RFM95_CS 10  // LoRa chip select pin
//#define RFM95_RST 9  // LoRa reset pin
//#define RFM95_INT 2  // LoRa interrupt pin
//#define RF95_FREQ 915.0 // LoRa frequency in MHz
//
//TinyGPSPlus gps;
//
//SoftwareSerial ss(RXPin, TXPin);
//
//void setup()
//{
//  Serial.begin(115200);
//  ss.begin(GPSBaud);
//}
//
//void loop()
//{
//  while (ss.available() > 0)
//    if (gps.encode(ss.read()))
//      displayInfo();
//
//  if (millis() > 5000 && gps.charsProcessed() < 10)
//  {
//    Serial.println(F("No GPS detected: check wiring."));
//    while(true);
//  }
//}
//
//void displayInfo()
//{
//  Serial.print(F("Location: ")); 
//  if (gps.location.isValid())
//  {
//    Serial.print(gps.location.lat(), 6);
//    Serial.print(F(","));
//    Serial.print(gps.location.lng(), 6);
//  }
//  else
//  {
//    Serial.print(F("INVALID"));
//  }
//  
//  Serial.println();
//}

#include <SPI.h>
#include <LoRa.h>

// Define LoRa module pin connections
#define SCK    18  // SPI Clock
#define MISO   19  // SPI MISO
#define MOSI   23  // SPI MOSI
#define SS     15  // Chip Select (CS)
#define RST    4   // Reset
#define DIO0   2   // Interrupt (IRQ)

// Define frequency in Hz
#define BAND   433E6  // 433 MHz

void setup() {
    Serial.begin(115200);
    while (!Serial);
    Serial.println("Starting LoRa Receiver...");

    // Initialize SPI and LoRa
    SPI.begin(SCK, MISO, MOSI, SS);
    LoRa.setPins(SS, RST, DIO0); 

    if (!LoRa.begin(BAND)) {
        Serial.println("LoRa initialization failed!");
        while (1);
    }

    Serial.println("LoRa Receiver Initialized!");
}

void loop() {
    // Check if data is received
    int packetSize = LoRa.parsePacket();
    if (packetSize) {
      Serial.println("Packet received!");

      String receivedMessage = "";
      while (LoRa.available()) {
          receivedMessage += (char)LoRa.read();
      }

      Serial.print("Received: ");
      Serial.println(receivedMessage);
      
      // Print RSSI (signal strength)
      Serial.print("RSSI: ");
      Serial.println(LoRa.packetRssi());

      Serial.println("---------------------");
    }
}
