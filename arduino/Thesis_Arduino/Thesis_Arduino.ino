#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD13086.h>

static const int RXPin = 0, TXPin = 1, NSS = 2, MOSI = 3, DIO0 = 4, MISO = 5, SCK = 6, SCL = 14, SDA = 15, LED1 = 16, LED2 = 17;

TinyGPSPlus gps;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

SoftwareSerial ss(RXPin, TXPin);

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 

void sendData(data) {
  LoRa.beginPacket();
  LoRa.print(data);
  LoRa.endPacket();
}

void setup() {

  Serial.begin(9600);
  ss.begin(9600);

  pinMode(LED1, OUTPUT)
  pinMode(LED2, OUTPUT)

  LoRa.setPins(NSS, -1, DIO0);

  while (!Serial);
  Serial.println("LoRa Sender");
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }

  display.clearDisplay();

}

void loop() {

  //GPS
  while (ss.available() > 0){
  gps.encode(ss.read());
  if (gps.location.isUpdated()){

  String currentLatitude = gps.location.lat
  String currentLongitude = gps.location.lng

  String messageFormat = id + "-" + currentLatitude + "-" + currentLongitude;
  //di ko pa alam pano gagawin yung id

  //LoRa - transmitting
  sendData(messageFormat);

  //LoRa - Recieving
  int packetSize = LoRa.parsePacket();
  if (packetSize) { 
    while (LoRa.available())
    {
      String received = LoRa.read();
    }
    LoRa.packetRssi();    
  }

  // LoRa - Resending of Recieved data
  sendData(recieved);

  //OLED Display


}
