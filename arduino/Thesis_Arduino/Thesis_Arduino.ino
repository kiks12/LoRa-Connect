#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD13086.h>

#define idLength = 8 //temporary
//GPS
#define RXPin = 0
#define TXPin = 1
//LoRa
#define NSS = 2
#define MOSI = 3
#define DIO0 = 4
#define MISO = 5
#define SCK = 6
//3-way switch
#define levelOne = 9
#define levelTwo = 10
#define levelThree = 11
//Interrupt
#define interruptPin = 12
//OLED
#define SCL = 14
#define SDA = 15
//LED
#define LED1 = 16
#define LED2 = 17

TinyGPSPlus gps;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1); //OLED

SoftwareSerial ss(RXPin, TXPin);

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64

unsigned long startMillis;
unsigned long currentMillis;
unsigned long intervalMillis = 500; //temporary value

void sendData(data) {
  LoRa.beginPacket();
  LoRa.print(data);
  LoRa.endPacket();
}

  //Interrupt
void transmitLocation(){
  //GPS
  while (ss.available() > 0){
  gps.encode(ss.read());
  if (gps.location.isUpdated()){

  String currentLatitude = gps.location.lat
  String currentLongitude = gps.location.lng

  String currentLocation = id + "-" + currentLatitude + "-" + currentLongitude + "-" + severity;
 //di ko pa alam pano gagawin yung id

  //LoRa - transmitting of bracelet's current location
  sendData(currentLocation);

  //OLED Display
  //temporary block of code
  startMillis = millis();

  if (startMillis - currentMillis >= intervalMillis) {
    display.startscrollleft(0x00, 0x0F);
    currentMillis = startMillis;
  }
  display.stopscroll();

}

void setup() {

  Serial.begin(9600);
  ss.begin(9600);

  pinMode(LED1, OUTPUT)
  pinMode(LED2, OUTPUT)
  pinMode(interruptPin, OUTPUT)

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

  display.clearDisplay(); //OLED
  dispaly.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0); //temporary
  display.println(instruction);
  display.display();

  instructionreceived[] = {};

  int severity = 1;

  attachInterrupt(digitalPinToInterrupt(interruptPin), transmitLocation, RISING);

}

void loop() {

//3-way switch
  if(levelOne = HIGH){
    severity == 1;
  }

  if(levelTwo = HIGH){
    severity == 2;
  }

  if(levelThree = HIGH){
    severity == 3;
  }
 
  //LoRa - Recieving
  int packetSize = LoRa.parsePacket();
  if (packetSize) { 
    while (LoRa.available())
    {
      String received = LoRa.read();
    }
    LoRa.packetRssi();    
  }

  // LoRa - Retransmitting of received data form other bracelets
  sendData(received);

  //Recieving - Extraction of instruction from message from central node
  //ID checker
  for (int i = 0; i < idLength; i++) {
    char character = received[i];
    if(character == centralNodeID[i]){
      checker++;
    }
  }

  if (checker == idLength){
    for (int i = idLength + 1; i < strlen(received); i++) {
    String instruction = received.substring(idLength + 1 , received.length());
    checker = 0;
    digitalwrite(interruptPin, HIGH)
  }

}