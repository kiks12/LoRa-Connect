//user device

// Turns the 'PRG' button into the power button, long press is off 
#define HELTEC_POWER_BUTTON   // must be before "#include <heltec_unofficial.h>"

// Define build flags directly in the code
#define DEVICE_TYPE 0
#define USER_ID "1"
#define DEVICE_ADDR "0001"

#include <heltec_unofficial.h>
#include <TinyGPSPlus.h>

#define PAUSE               0
#define FREQUENCY           433.0       
#define BANDWIDTH           250.0
#define SPREADING_FACTOR    9
#define CODING_RATE         5
#define TRANSMIT_POWER      0

#define RXD2 47
#define TXD2 48

#define SOS_PIN 21
#define URGENCY_PIN_1 38
#define URGENCY_PIN_2 39

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

volatile bool sos_flag = false;

int last_gps_update_time = 0;
volatile uint8_t urgency;

void IRAM_ATTR handleSOSInterrupt() {
    sos_flag = true;
}

void IRAM_ATTR handleUrgencyInterrupt() {
    bool pin38 = digitalRead(URGENCY_PIN_1);
    bool pin39 = digitalRead(URGENCY_PIN_2);

    if (pin38 && pin39) {
        urgency = 3;
    } else if (pin38) {
        urgency = 1;
    } else if (pin39) {
        urgency = 2;
    } else {
        urgency = 0;
    }
}

void rx() {
    rx_flag = true;
}

void setup() {
    heltec_setup();

    // Configure GPIO pins
    pinMode(SOS_PIN, INPUT_PULLUP);
    pinMode(URGENCY_PIN_1, INPUT_PULLUP);
    pinMode(URGENCY_PIN_2, INPUT_PULLUP);

    // Attach interrupts
    attachInterrupt(SOS_PIN, handleSOSInterrupt, RISING);
    attachInterrupt(URGENCY_PIN_1, handleUrgencyInterrupt, CHANGE);
    attachInterrupt(URGENCY_PIN_2, handleUrgencyInterrupt, CHANGE);

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

    both.println("User");
    both.printf("Device address: %s\n", DEVICE_ADDR);
}

void txPacket(String packet) {
    radio.clearDio1Action();
    heltec_led(50);
    RADIOLIB(radio.transmit(packet.c_str()));
    heltec_led(0);
    radio.setDio1Action(rx);
    RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));
}

void txPacket(bool isSOS) {
    char packet[250];
    char lat_buffer[12];
    char lng_buffer[12];
    dtostrf(gps.location.lat(), 10, 6, lat_buffer);
    dtostrf(gps.location.lng(), 10, 6, lng_buffer);

    char id_buffer[3];
    snprintf(id_buffer, sizeof(id_buffer), "%02d", current_packet_id);
    current_packet_id++;
    if (current_packet_id > 99) { current_packet_id = 0; }

    if (isSOS) {

        both.printf(DEVICE_ADDR);
        snprintf(packet, sizeof(packet), "%s1004%s22%s-%s-%s-%d", DEVICE_ADDR, id_buffer, USER_ID, lat_buffer, lng_buffer, urgency);
        both.printf("Sn:%s\n", packet);
        txPacket((String) packet);
    } else {
        snprintf(packet, sizeof(packet), "%s1001%s12%s-%s-%d", DEVICE_ADDR, id_buffer, lat_buffer, lng_buffer, urgency);
        both.printf("Location packet: %s\n", packet);
        txPacket((String) packet);
    }
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
        both.printf("New, process\n");
        packet_history[packet_history_index] = incoming;
        packet_history_index++;
        if (packet_history_index >= PACKET_HISTORY_SIZE) {
            packet_history_index = 0;
        }
        return false;
    } else {
        both.printf("Old, ignore\n");
        return true;
    }
}

bool tx_loc_flag = false;
String instruction;
String rescuer_name;

void processPayload(char type, String payload) {
    if (type == '7') {
        tx_loc_flag = true;
        both.println("Starting location tx");
    } else if (type == '8') {
        instruction = payload;
    } else if (type == 'A') {
        both.println(payload.c_str());
        uint8_t dash_index = payload.indexOf('-');
        rescuer_name = payload.substring(0, dash_index);
        String distance = payload.substring(dash_index + 1);
        both.printf("Rescuer name: %s\n", rescuer_name.c_str());
        both.printf("Distance: %s\n", distance.c_str());
    }
}

void loop() {
    heltec_loop();

    if (button.isDoubleClick()) {
        sos_flag = true;
    }

    if (button.isSingleClick()) {
        urgency++;
        if (urgency > 3) {
            urgency = 0;
        }
        both.printf("Urgency level: %d\n", urgency);
        // txPacket("");
    }

    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
    }
    
    if (gps.location.isUpdated()) {
        if (last_gps_update_time + 3000 < millis() && tx_loc_flag) {
            txPacket(sos_flag);
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
            String incoming = rx_data_str.substring(0,4) + rx_data_str.substring(8,10);
            both.println(dst.c_str());
            both.println(incoming.c_str());

            if (dst == DEVICE_ADDR || dst == "1003") {

                if (isFamiliarProcess(incoming) == false) {
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