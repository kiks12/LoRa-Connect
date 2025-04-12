
// user device

// Turns the 'PRG' button into the power button, long press is off
#define HELTEC_POWER_BUTTON // must be before "#include <heltec_unofficial.h>"

// Define build flags directly in the code
#define DEVICE_TYPE 0
#define USER_ID "1"
#define DEVICE_ADDR "0001"

#include <heltec_unofficial.h>
#include <TinyGPSPlus.h>

#define PAUSE 0
#define FREQUENCY 433.0
#define BANDWIDTH 250.0
#define SPREADING_FACTOR 9
#define CODING_RATE 5
#define TRANSMIT_POWER 20

#define RXD2 47
#define TXD2 48

#define URGENCY_PIN_1 2
#define URGENCY_PIN_2 38
#define SOS_PIN 39

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

const int PACKET_HISTORY_SIZE = 20;
String packet_history[PACKET_HISTORY_SIZE];
int packet_history_index = 0;

const int BOUNCED_PACKET_HISTORY_SIZE = 20;
String bounced_packet_history[BOUNCED_PACKET_HISTORY_SIZE];
int bounced_packet_history_index = 0;

uint8_t current_packet_id = 0;

volatile bool sos_flag = false;
// volatile bool sos_once_flag = false;
volatile bool rx_flag = false;
volatile bool urg_update = false;

volatile uint8_t urgency = 1;

int last_tx_loc_time = 0;

void urgencyChanged()
{
    bool pin1 = digitalRead(URGENCY_PIN_1);
    bool pin2 = digitalRead(URGENCY_PIN_2);
    if (pin1 == true && pin2 == true)
    {
        urgency = 2;
    }
    else if (pin1 == true && pin2 == false)
    {
        urgency = 3;
    }
    else if (pin1 == false && pin2 == true)
    {
        urgency = 1;
    }
    urg_update = true;
}

volatile int last_sos_button_time;
void sosPressed()
{
    // if (sos_flag == false)
    // {
    //     sos_once_flag = true;
    sos_flag = true;
}

void rx() { rx_flag = true; }

void setup()
{
    heltec_setup();

    pinMode(URGENCY_PIN_1, INPUT_PULLUP);
    pinMode(URGENCY_PIN_2, INPUT_PULLUP);
    pinMode(SOS_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(URGENCY_PIN_1), urgencyChanged, CHANGE);
    attachInterrupt(digitalPinToInterrupt(URGENCY_PIN_2), urgencyChanged, CHANGE);
    attachInterrupt(digitalPinToInterrupt(SOS_PIN), sosPressed, FALLING);  

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

void txPacket(String packet)
{
    radio.clearDio1Action();
    heltec_led(50);
    RADIOLIB(radio.transmit(packet.c_str()));
    heltec_led(0);
    radio.setDio1Action(rx);
    RADIOLIB_OR_HALT(radio.startReceive(RADIOLIB_SX126X_RX_TIMEOUT_INF));
}

void txLocPacket(bool isSOS)
{
    char packet[255];
    char lat_buffer[12];
    char lng_buffer[12];
    dtostrf(gps.location.lat(), 10, 6, lat_buffer);
    dtostrf(gps.location.lng(), 10, 6, lng_buffer);

    char id_buffer[3];
    snprintf(id_buffer, sizeof(id_buffer), "%02d", current_packet_id);
    current_packet_id++;
    if (current_packet_id > 99)
    {
        current_packet_id = 0;
    }

    if (isSOS)
    {
        snprintf(packet, sizeof(packet), "%s1004%s22%s-%s-%d", DEVICE_ADDR, id_buffer, lat_buffer, lng_buffer, urgency);
        both.printf("Send SOS:%s\n", packet);
        txPacket(packet);
    }
    else
    {
        snprintf(packet, sizeof(packet), "%s1001%s12%s-%s-%d", DEVICE_ADDR, id_buffer, lat_buffer, lng_buffer, urgency);
        both.printf("Send LOC: %s\n", packet);
        txPacket(packet);
    }
}

bool isFamiliarBounce(String incoming)
{
    String *p = std::find(bounced_packet_history, bounced_packet_history + BOUNCED_PACKET_HISTORY_SIZE, incoming);
    if (p == bounced_packet_history + BOUNCED_PACKET_HISTORY_SIZE)
    {
        both.printf("New, reTx\n");
        bounced_packet_history[bounced_packet_history_index] = incoming;
        bounced_packet_history_index++;
        if (bounced_packet_history_index >= PACKET_HISTORY_SIZE)
        {
            bounced_packet_history_index = 0;
        }
        return false;
    }
    else
    {
        both.printf("Old, no reTx\n");
        return true;
    }
}

bool isFamiliarProcess(String incoming)
{
    String *p = std::find(packet_history, packet_history + PACKET_HISTORY_SIZE, incoming);
    if (p == packet_history + PACKET_HISTORY_SIZE)
    {
        both.printf("New, process\n");
        packet_history[packet_history_index] = incoming;
        packet_history_index++;
        if (packet_history_index >= PACKET_HISTORY_SIZE)
        {
            packet_history_index = 0;
        }
        return false;
    }
    else
    {
        both.printf("Old, ignore\n");
        return true;
    }
}

bool tx_loc_flag = false;
String instruction;

void processPayload(char type, String payload)
{
    if (type == '7')
    {
        both.println("Starting location tx");
        tx_loc_flag = true;
        last_tx_loc_time = millis();
    }
    else if (type == '8')
    {
        instruction = payload;
        both.println(instruction);
    }
    else if (type == 'A')
    {
        sos_flag = false;
        both.printf("Distance: %s\n", payload.c_str());
    }
}

String urgency_strings[3] = {"Low", "Moderate", "Severe"};
int last_bat_update = 0;
void loop()
{
    heltec_loop();

    if (last_bat_update + 1000 < millis())
    {
        display.print(heltec_battery_percent());
        display.println(heltec_vbat());
        last_bat_update = millis();
    }

    while (gpsSerial.available())
    {
        gps.encode(gpsSerial.read());
    }

    if (urg_update)
    {
        urg_update = false;
        both.println("Set urgency to: " + urgency_strings[urgency-1]);
    }

    // if (sos_once_flag)
    // {
    //     sos_once_flag = false;
    //     txLocPacket(true);
    //     delay(50);
    //     last_tx_loc_time = millis();
    // }

    if (sos_flag)
    {
        sos_flag = false;
        if (millis() > last_sos_button_time + 100);
        {
            txLocPacket(true);
            last_sos_button_time = millis();
        }
    }

    if (gps.location.isUpdated())
    {
        // if (last_tx_loc_time + 1000 < millis()) {
        //     both.println(gps.location.lng());
        // }
        if (last_tx_loc_time + 3000 < millis() && tx_loc_flag)
        {
            txLocPacket(sos_flag);
            last_tx_loc_time = millis();
        }
    }

    if (rx_flag)
    {
        rx_flag = false;
        char rx_data[255] = {0};

        radio.readData((uint8_t *)rx_data, 255);
        if (_radiolib_status == RADIOLIB_ERR_NONE)
        {
            String rx_data_str = (String)rx_data;
            String dst = rx_data_str.substring(4, 8);
            String incoming = rx_data_str.substring(0, 4) + rx_data_str.substring(8, 10);

            if (dst == DEVICE_ADDR || dst == "1003")
            {
                if (isFamiliarProcess(incoming) == false)
                {
                    char type = rx_data[10];
                    processPayload(type, rx_data_str.substring(12));
                }
            }
            else
            {
                if (isFamiliarBounce(incoming) == false)
                {
                    int ttl = rx_data[12] - '0';
                    if (ttl > 0)
                    {
                        String new_packet = rx_data_str.substring(0, 8) + String(ttl - 1) + rx_data_str.substring(10);
                        txPacket(new_packet);
                    }
                }
            }
        }
    }
}