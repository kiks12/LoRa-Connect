#include <RadioLib.h>
#include <NimBLEDevice.h>  // ESP32-S3 BLE Library

// LoRa SX1262 Pin Definitions
// #define LORA_CS    8  // SPI Chip Select (NSS)
// #define LORA_RST   12 // Reset
// #define LORA_BUSY  14 // Busy
// #define LORA_DIO1  13 // IRQ Pin (DIO1)

SX1262 radio = new Module(SS, RADIOLIB_NC, RADIOLIB_NC, RADIOLIB_NC);

#define SERVICE_UUID        "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID "abcdef12-3456-7890-1234-56789abcdef1"
#define DESCRIPTOR_UUID "00002902-0000-1000-8000-00805f9b34fb"

NimBLEServer* bleServer = nullptr;
NimBLECharacteristic* bleTxCharacteristic = nullptr;
NimBLEDescriptor* bleTxDescriptor = nullptr;

bool bleClientConnected = false;

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* server) {
    bleClientConnected = true;
    Serial.println("BLE Client Connectd!");
  }
  void onDisconnect(NimBLEServer* server) {
    bleClientConnected = false;
    Serial.println("BLE Client Disconnected!");
  }
};

// void sendBLE(String data) {
//   // if (bleClientConnected) {
//     bleTxCharacteristic->setValue(data.c_str());
//     bleTxCharacteristic->notify();
//     Serial.println("Sent via BLE: " + data);
//   // }
// }

void sendBLE(String data) {
  const int MAX_PACKET_SIZE = 20;  // BLE max packet size
  const String END_MARKER = "-ENDP"; 
  int dataLen = data.length();

  for (int i = 0; i < dataLen; i += MAX_PACKET_SIZE) {
    // Check if the remaining space is not enough to fit "ENDP"
    bool lastChunk = (i + MAX_PACKET_SIZE >= dataLen);
    bool needsCarryOver = (!lastChunk && (dataLen - i) % MAX_PACKET_SIZE <= 4);
    
    String chunk;
    if (lastChunk) {
      chunk = data.substring(i, dataLen) + END_MARKER;
    } else if (needsCarryOver) {
      chunk = data.substring(i, i + MAX_PACKET_SIZE - 4);
    } else {
      chunk = data.substring(i, i + MAX_PACKET_SIZE);
    }

    bleTxCharacteristic->setValue(chunk.c_str());
    bleTxCharacteristic->notify();
    Serial.println("Sent via BLE: " + chunk);

    delay(50);  // Delay to ensure proper transmission

    // If we had to move "ENDP" to the next fragment
    if (needsCarryOver) {
      bleTxCharacteristic->setValue(END_MARKER.c_str());
      bleTxCharacteristic->notify();
      Serial.println("Sent via BLE: " + END_MARKER);
      break;  // End transmission
    }
  }
}

// lora receive
void receiveCallback() {
  Serial.println("LoRa Packet Received!");

  uint8_t buffer[255];
  int length = radio.getPacketLength();
  // Serial.println(length);

  //radio.readData stores the LoRa's last received packet in the buffer array
  int state = radio.readData(buffer, length);
  if (state == RADIOLIB_ERR_NONE) {
    Serial.print("LoRa Message: ");
    String s = "";

      for (int i = 0; i < length; i++) {
        //convert to char because it is a uint8_t
        s += (char) buffer[i];
      }

      sendBLE(s);
  } else {
    Serial.println("LoRa Packet Reception Failed.");
  }


  radio.startReceive();
}

void setup() {

  Serial.begin(115200);

//                        frq    bw    sf cr  sw  pw  p  tcxo
  int state = radio.begin(915.0, 125.0, 9, 5, 22, 17, 8, 1.7);
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println("LoRa Initialized!");
  } else {
    Serial.print("LoRa Init Failed! Code: ");
    Serial.println(state);
    while (true)
      ;
  }

  radio.setDio1Action(receiveCallback);
  radio.startReceive();

  NimBLEDevice::init("LoRa_BLE_Receiver");
  NimBLEDevice::setDeviceName("LoRa_BLE_Receiver");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);
  NimBLEDevice::setMTU(512);

  bleServer = NimBLEDevice::createServer();
  bleServer->setCallbacks(new ServerCallbacks());
  NimBLEService* bleService = bleServer->createService(SERVICE_UUID);

  bleTxCharacteristic = bleService->createCharacteristic(
    CHARACTERISTIC_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );

  bleTxDescriptor = bleTxCharacteristic->createDescriptor(
    DESCRIPTOR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );

  bleService->start();
  NimBLEAdvertising* bleAdvertising = NimBLEDevice::getAdvertising();
  bleAdvertising->setName("LoRa_BLE_Receiver");
  bleAdvertising->addServiceUUID(bleService->getUUID());
  bleAdvertising->start();

  Serial.println("BLE UART ready");
}

void loop() {
  // LoRa reception is handled via interrupts (DIO1)
  sendBLE("100411000095312152025-Trial Dummy Sample UPDATED-15.133179-120.597592-7-1-3");
  sendBLE("1004110000B51-Obstacle 1-Concrete-15.150976-120.593229");
  delay(20000);
}