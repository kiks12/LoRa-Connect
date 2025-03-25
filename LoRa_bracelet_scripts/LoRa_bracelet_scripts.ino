// Turns the 'PRG' button into the power button, long press is off 
#define HELTEC_POWER_BUTTON   // must be before "#include <heltec_unofficial.h>"

#include <heltec_unofficial.h>

#define PAUSE               0
#define FREQUENCY           433.0       
#define BANDWIDTH           250.0
#define SPREADING_FACTOR    7
#define TRANSMIT_POWER      0

#include <TinyGPSPlus.h>

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

#define RXD2 47
#define TXD2 48

#include <NimBLEDevice.h>
#include <queue>

#define WRITE_CHARACTERISTIC_UUID "04fb4f85-eb68-4d2a-bf8e-57c63a01cddf"
#define READ_CHARACTERISTIC_UUID "d28bbf99-ca9f-4e97-bb0b-df5ae9254068"

volatile bool rx_flag = false;

const char* ADDRESS = "1100";

const int PACKET_HISTORY_SIZE = 20;
String packet_history[PACKET_HISTORY_SIZE];
int packet_history_index = 0;

const int BOUNCED_PACKET_HISTORY_SIZE = 20;
String bounced_packet_history[PACKET_HISTORY_SIZE];
int bounced_packet_history_index = 0;


uint8_t state = 0; //Default state, send SOS every 10 seconds
uint8_t current_packet_id = 0;

bool loc_update_flag = false;
bool tsk_update_flag = false;

int last_loc_update_time = 0;
int last_tsk_update_time = 0;

NimBLEService*        pService = NULL;
NimBLECharacteristic* pWriteCharacteristic = NULL;
NimBLECharacteristic* pReadCharacteristic  = NULL;

BLEServer *pServer;
std::queue<String> BT_queue;
bool BT_flag = false;

#include <sstream>
#include <iomanip>

uint8_t hexToDecimal(String hexStr) {
  uint8_t value;
  std::stringstream ss;
  ss << std::hex << hexStr;
  ss >> value;
  return value;
}

std::string decimalToHex(uint8_t value) {
  std::stringstream ss;
  ss << std::uppercase << std::hex << std::setw(2) << std::setfill('0') << value;
  return ss.str();
}

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override {
    pServer->updateConnParams(connInfo.getConnHandle(), 24, 48, 0, 180);
  }
  void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override {
    NimBLEDevice::startAdvertising();
  }
} serverCallbacks;

class CharacteristicCallbacks : public NimBLECharacteristicCallbacks {
  void onRead(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
    if (BT_queue.empty() == false) {
      pWriteCharacteristic->setValue(BT_queue.front());
      BT_queue.pop();
    }
  }
  void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
  }
  /** The value returned in code is the NimBLE host return code. */
  void onStatus(NimBLECharacteristic* pCharacteristic, int code) override {
      Serial.printf("Notification/Indication return code: %d, %s\n", code, NimBLEUtils::returnCodeToString(code));
  }
  /** Peer subscribed to notifications/indications */
  void onSubscribe(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo, uint16_t subValue) override {   
  }
} chrCallbacks;

void rx() {
  rx_flag = true;
}

void setup() {
  heltec_setup();
  display.setBrightness(200);

  gpsSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);
  gpsSerial.println("$PMTK220,3000*1C");
  // display.println("GPS ready");

  int state = radio.begin();
  if (state == RADIOLIB_ERR_NONE) {
    // display.println("Radio initialized");
  } else {
    // display.printf("Radio failed, code: %i\n", state);
  }

  radio.setDio1Action(rx);

  RADIOLIB_OR_HALT(radio.setFrequency(FREQUENCY));
  RADIOLIB_OR_HALT(radio.setBandwidth(BANDWIDTH));
  RADIOLIB_OR_HALT(radio.setSpreadingFactor(SPREADING_FACTOR));
  RADIOLIB_OR_HALT(radio.setOutputPower(TRANSMIT_POWER));
  RADIOLIB_OR_HALT(radio.setCodingRate(5)); // TRY LANG

  RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));

  NimBLEDevice::init("Heltec V3");
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(&serverCallbacks);
  pService = pServer->createService("af2b06a5-8a8e-41d6-9cba-b49e2500ae05");
  pWriteCharacteristic = pService->createCharacteristic(WRITE_CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
  pReadCharacteristic  = pService->createCharacteristic(READ_CHARACTERISTIC_UUID , NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
  pReadCharacteristic->setCallbacks(new CharacteristicCallbacks());
  pService->start();
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->setName("NimBLE-Server");
  pAdvertising->addServiceUUID(pService->getUUID());
  pAdvertising->enableScanResponse(true);
  pAdvertising->start();

  both.println(0 == 0 ? "User" : "Rescuer");
}

void txPacket(String packet) {
  radio.clearDio1Action();
  heltec_led(50);

  RADIOLIB(radio.transmit(packet.c_str()));

  heltec_led(0);
  radio.setDio1Action(rx);
  RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));
}

String user_addr;

void rescuerProcessPayload(uint8_t type, String payload) {
  switch (type) {
    case 7: {
      both.printf("START_LOC_TX received\n");
      loc_update_flag = true;

      break;
    }
    case 1:
    case 9: 
      both.printf("%s received\n", type == 1 ? "USER LOCATION" : "TASK ASSIGN");

      if (user_addr == NULL && type == 9) {
        user_addr = payload.substring(12,16);
        both.printf("USER_ADDR: %s\n", user_addr);
      } else if (type == 9) {
        both.printf("TASK ASSIGN bypassed filter");
      }

      uint8_t len = payload.length();
      uint8_t chunks_len = (len + 20 - 1) / 20;

      for (int i = 0; i < chunks_len; i++) {
        uint8_t start = i * 20;
        uint8_t end = min(start + 20, (int) len);  
        String chunk = payload.substring(start, end);
        BT_queue.push(chunk);
      }

      BT_queue.push("ENDP");
      BT_flag = true;
      pWriteCharacteristic->notify();
      break;
  }
}



void loop() {
  heltec_loop();

  // both.print("Sending: Hello From Device");
  // txPacket("Hello from Device");
  // delay(1000);

  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (millis() - last_loc_update_time >= 3000) {
    if (gps.location.isUpdated()) {
      both.print("Lat: "); both.println(gps.location.lat(), 6);
      both.print("Lon: "); both.println(gps.location.lng(), 6);

      char packet[231];
      char lat_buffer[12];
      char lng_buffer[12];
      dtostrf(gps.location.lat(), 10, 6, lat_buffer);
      dtostrf(gps.location.lng(), 10, 6, lng_buffer); 
      snprintf(packet, sizeof(packet), "11001004ff95312152025-Trial-%s-%s-7-1-3", lat_buffer, lng_buffer); // LOCATION_FROM_USER, src 1100, dst 0001, 
      
      txPacket(packet);
      // txPacket();

    }
    last_loc_update_time = millis();
  }

  if (button.isSingleClick()) {
    String packet = "00011100ff951102-312152025-Trial-15.133179-120.597592-7-1-3";

    txPacket(packet);
  }

  // if (BT_flag) {
  //   BT_flag = false;
  //   // There is BT data to be sent, send the first in queue, the rest will be obtained as mobile device triggers onRead callback
  //   pWriteCharacteristic->setValue((String) BT_queue.front());
  //   BT_queue.pop();
  // }

  if (rx_flag) {
    rx_flag = false;
    char rx_data[255] = {0};

    radio.readData((uint8_t*) rx_data, 255);
    if (_radiolib_status == RADIOLIB_ERR_NONE) {
      both.print(rx_data);
      String dst = ((String)rx_data).substring(4,8);
      uint8_t type = rx_data[10]-'0'; // ignore 1 or 6

      if (dst != ADDRESS || dst == "1003" || dst == "1001") {
        // Not for me, decrement TTL and retransmit

        String incoming = ((String) rx_data).substring(0,9);
        
        String * p = std::find(bounced_packet_history, bounced_packet_history+BOUNCED_PACKET_HISTORY_SIZE, incoming);
        if (p == bounced_packet_history+BOUNCED_PACKET_HISTORY_SIZE) {
          both.printf("New, reTx\n");
          bounced_packet_history[bounced_packet_history_index] = incoming;
          bounced_packet_history_index++;
          if (bounced_packet_history_index >= PACKET_HISTORY_SIZE) {
            bounced_packet_history_index = 0;
          }
          txPacket("00011100ff951100-312152025-Trial-15.133179-120.597592-7-1-3");


        } else {
          both.printf("Old, no reTx\n");  
        }
        
        
      } else {

        String incoming = ((String) rx_data).substring(0,10);
        both.printf(incoming.c_str());
        
        String * p = std::find(packet_history, packet_history+PACKET_HISTORY_SIZE, incoming);
        if (p == packet_history+PACKET_HISTORY_SIZE) {
          both.printf("PacketID new, processing\n");
          packet_history[packet_history_index] = incoming;
          packet_history_index++;
          if (packet_history_index >= PACKET_HISTORY_SIZE) {
            packet_history_index = 0;
          }

          rescuerProcessPayload(type, (String) rx_data);

        } else {
          both.printf("PacketID old, ignore\n");  
        }
      }


    }

  }
}











