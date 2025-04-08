//rescuer device

// Turns the 'PRG' button into the power button, long press is off 
#define HELTEC_POWER_BUTTON   // must be before "#include <heltec_unofficial.h>"

#include <heltec_unofficial.h>
#include <TinyGPSPlus.h>
#include <NimBLEDevice.h>
#include <queue>

#define DEVICE_TYPE 1
#define USER_ID "1"
#define DEVICE_ADDR "1100"
#define SERVICE_UUID "dc0d15eb-6298-44e3-9813-d9a5c58c43cc"
#define WRITE_CHARACTERISTIC_UUID "d0d12d27-be27-4495-a236-9fa0860b4554"
#define READ_CHARACTERISTIC_UUID "c31628d9-f40c-4e67-a03a-3a0445b44ce0"
#define DESCRIPTOR_UUID "caed62e7-f146-4fe4-a0d2-609edaf76228"

#define PAUSE               0
#define FREQUENCY           433.0       
#define BANDWIDTH           250.0
#define SPREADING_FACTOR    9
#define CODING_RATE         5
#define TRANSMIT_POWER      0

#define RXD2 47
#define TXD2 48

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

volatile bool rx_flag = false;

const int PACKET_HISTORY_SIZE = 20;
String packet_history[PACKET_HISTORY_SIZE];
int packet_history_index = 0;

const int BOUNCED_PACKET_HISTORY_SIZE = 20;
String bounced_packet_history[BOUNCED_PACKET_HISTORY_SIZE];
int bounced_packet_history_index = 0;

uint8_t current_packet_id = 0;

bool sos_flag = false;

int last_gps_update_time = 0;

void rx() {
    rx_flag = true;
}

NimBLEService*        pService = NULL;
NimBLECharacteristic* pWriteCharacteristic = NULL;
NimBLECharacteristic* pReadCharacteristic  = NULL;
NimBLEDescriptor*     pDescriptor = NULL;
BLEServer *pServer;

std::queue<String> BT_queue;
bool BT_flag = false;

void txPacket(String packet) {
    radio.clearDio1Action();
    heltec_led(50);
    RADIOLIB(radio.transmit(packet.c_str()));
    heltec_led(0);
    radio.setDio1Action(rx);
    RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));
}

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override {
    pServer->updateConnParams(connInfo.getConnHandle(), 24, 48, 0, 180);
    pServer->getAdvertising()->stop();
    both.println("BLE Connected");
  }
  void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override {
    both.println("BLE Disconnected");
    NimBLEDevice::startAdvertising();
  }
} serverCallbacks;

class CharacteristicCallbacks : public NimBLECharacteristicCallbacks {
  void onRead(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
    // if (BT_queue.empty() == false) {
    //   pWriteCharacteristic->setValue(BT_queue.front());
    //   BT_queue.pop();
    // }
  }
  void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
  }
  void onStatus(NimBLECharacteristic* pCharacteristic, int code) override {
  }
  void onSubscribe(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo, uint16_t subValue) override {   
  }
} chrCallbacks;

class ReadCharacteristicCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
      String value = pCharacteristic->getValue().c_str();
      both.printf("BLE: %s\n", value.c_str());
      txPacket(value);
  }
};

void setup() {
    heltec_setup();

    gpsSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);
    gpsSerial.println("$PMTK220,3000*1C");
  
    int state = radio.begin();
    radio.setDio1Action(rx);
    RADIOLIB_OR_HALT(radio.setFrequency(FREQUENCY));
    RADIOLIB_OR_HALT(radio.setBandwidth(BANDWIDTH));
    RADIOLIB_OR_HALT(radio.setSpreadingFactor(SPREADING_FACTOR));
    RADIOLIB_OR_HALT(radio.setCodingRate(CODING_RATE));
    RADIOLIB_OR_HALT(radio.setOutputPower(TRANSMIT_POWER));
    RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));

    NimBLEDevice::init("Heltec V3");
    pServer = NimBLEDevice::createServer();
    pServer->setCallbacks(&serverCallbacks);
    pService = pServer->createService(SERVICE_UUID);
    pWriteCharacteristic = pService->createCharacteristic(WRITE_CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
    pReadCharacteristic  = pService->createCharacteristic(READ_CHARACTERISTIC_UUID , NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
    pDescriptor = pWriteCharacteristic->createDescriptor(DESCRIPTOR_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
    pReadCharacteristic->setCallbacks(new CharacteristicCallbacks());
    pReadCharacteristic->setCallbacks(new ReadCharacteristicCallbacks());
    pService->start();

    NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
    pAdvertising->setName("NimBLE-Server");
    pAdvertising->addServiceUUID(pService->getUUID());
    pAdvertising->enableScanResponse(true);
    pAdvertising->start();

    both.println("Rescuer");
    both.printf("Device address: %s\n", DEVICE_ADDR);
}

void txLocPacket() {
    char packet[231];
    char lat_buffer[12];
    char lng_buffer[12];
    dtostrf(gps.location.lat(), 10, 6, lat_buffer);
    dtostrf(gps.location.lng(), 10, 6, lng_buffer);

    char id_buffer[3];
    snprintf(id_buffer, sizeof(id_buffer), "%02d", current_packet_id);
    current_packet_id++;
    if (current_packet_id > 99) { current_packet_id = 0; }

    snprintf(packet, sizeof(packet), "%s1004%s62%s-%s-%s", DEVICE_ADDR, id_buffer, USER_ID, lat_buffer, lng_buffer);
    both.printf("Location packet: %s\n", packet);

    txPacket(packet);
}

bool isFamiliarBounce(String incoming) {
    String * p = std::find(bounced_packet_history, bounced_packet_history+BOUNCED_PACKET_HISTORY_SIZE, incoming);
    if (p == bounced_packet_history+BOUNCED_PACKET_HISTORY_SIZE) {
        both.printf("New, reTx\n");
        bounced_packet_history[bounced_packet_history_index] = incoming;
        bounced_packet_history_index++;
        if (bounced_packet_history_index >= PACKET_HISTORY_SIZE) {
            bounced_packet_history_index = 0;
        }
        return false;
    } else {
        both.printf("Old, no reTx\n");
        return true;
    }
}

bool isFamiliarProcess(String incoming) {
    String * p = std::find(packet_history, packet_history+PACKET_HISTORY_SIZE, incoming);
    if (p == packet_history+PACKET_HISTORY_SIZE) {
        both.printf("New, reTx\n");
        packet_history[packet_history_index] = incoming;
        packet_history_index++;
        if (packet_history_index >= PACKET_HISTORY_SIZE) {
            packet_history_index = 0;
        }
        return false;
    } else {
        both.printf("Old, no reTx\n");
        return true;
    }
}

bool tx_loc_flag = false;
String instruction;
String rescuer_name;

void processPayload(char type, String payload) {
    if (type == '7') {
        tx_loc_flag = true;    
    } else {
        both.println(payload.c_str());
        uint8_t len = payload.length();
        uint8_t chunks_len = (len + 20 - 1) / 20;

        for (int i = 0; i < chunks_len; i++) {
            uint8_t start = i * 20;
            uint8_t end = min(start + 20, (int) len);  
            String chunk = payload.substring(start, end);
            pWriteCharacteristic->setValue(chunk);
            pWriteCharacteristic->notify();
            delay(50);
            // BT_queue.push(chunk);
        }

        // BT_queue.push("ENDP");
        // BT_flag = true;
        pWriteCharacteristic->setValue("ENDP");
        pWriteCharacteristic->notify();
    }
}

void loop() {
    heltec_loop();

    if (button.isSingleClick()) {
        // txPacket("1100000100A2Doomfist-400");
        txPacket("100410030072");
    }

    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
    }
    
    if (gps.location.isUpdated()) {
        if (last_gps_update_time + 3000 < millis() && tx_loc_flag) {
            txLocPacket();
            last_gps_update_time = millis();
        }
    }

    if (rx_flag) {
        rx_flag = false;
        char rx_data[255] = {0};

        radio.readData((uint8_t*) rx_data, 255);
        if (_radiolib_status == RADIOLIB_ERR_NONE) {
            
            String rx_data_str = (String) rx_data;
            String dst = rx_data_str.substring(4,8);
            String incoming = rx_data_str.substring(0,4) + " " + rx_data_str.substring(8,10);
            both.printf("In: %s\n", incoming.c_str());
            // both.println(dst.c_str());
            // both.println(incoming.c_str());

            if (dst == DEVICE_ADDR || dst == "1003" || dst == "1002" || dst == "1001") {//remove 1004 later
                // both.println(rx_data_str.c_str());
                if (isFamiliarProcess(incoming) == false) {
                    both.println("new packet, will process");
                    // both.printf("New packet: %s\n", rx_data_str.c_str()); //process here
                    char type = rx_data[10];
                    // both.println("Type: " + String(type));
                    processPayload(type, rx_data_str.substring(12));
                } else {
                    // both.println("Recently processed");
                }

            } else {

                if (isFamiliarBounce(incoming) == false) {
                    // both.printf("New packet: %s\n", rx_data_str.c_str()); //retransmit here
                    int ttl = rx_data[12] - '0';
                    // both.printf("TTL: %d\n", ttl);
                    if (ttl > 0) {
                        String new_packet = rx_data_str.substring(0,8) + String(ttl-1) + rx_data_str.substring(10);
                        txPacket(new_packet);
                        // both.printf("ReTx: %s\n", new_packet.c_str());
                    } else {
                        // both.printf("TTL expired, no reTx\n");
                    }
                } else {
                    // both.printf("Bounced packet: %s\n", rx_data_str.c_str());
                }
                
            }

        }
    }
    
}