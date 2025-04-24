// rescuer device

// Turns the 'PRG' button into the power button, long press is off
#define HELTEC_POWER_BUTTON // must be before "#include <heltec_unofficial.h>"

#include <heltec_unofficial.h>
#include <TinyGPSPlus.h>
#include <NimBLEDevice.h>
#include <queue>

#define DEVICE_TYPE 1
#define USER_ID "1"        // 1, 2
#define DEVICE_ADDR "1100" // 1101, 1102
#define SERVICE_UUID "dc0d15eb-6298-44e3-9813-d9a5c58c43cc"
#define WRITE_CHARACTERISTIC_UUID "d0d12d27-be27-4495-a236-9fa0860b4554"
#define READ_CHARACTERISTIC_UUID "c31628d9-f40c-4e67-a03a-3a0445b44ce0"
#define DESCRIPTOR_UUID "00002902-0000-1000-8000-00805f9b34fb"
#define ADVERT_NAME "NimBLE Server 1"

#define PAUSE 0
#define FREQUENCY 433.0
#define BANDWIDTH 250.0
#define SPREADING_FACTOR 9
#define CODING_RATE 5
#define TRANSMIT_POWER 20

#define RXD2 47
#define TXD2 48

#define URGENCY_PIN_1 1
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
volatile bool sos_once_flag = false;
volatile bool rx_flag = false;
volatile bool urg_update = false;
bool BT_connected = false;

volatile uint8_t urgency = 1;

int last_tx_loc_time = 0;

void rx()
{
    rx_flag = true;
}

void urgencyChanged()
{
    bool pin1 = digitalRead(URGENCY_PIN_1);
    bool pin2 = digitalRead(URGENCY_PIN_2);
    if (pin1 == true && pin2 == true)
    {
        urgency = 1;
    }
    else if (pin1 == true && pin2 == false)
    {
        urgency = 2;
    }
    else if (pin1 == false && pin2 == true)
    {
        urgency = 0;
    }
    urg_update = true;
}

int sos_pressed_start;
volatile bool sos_state = false;
volatile bool sos_pressed = false;
void sosPressed()
{
    sos_state = digitalRead(SOS_PIN);
    sos_pressed = true;
}

NimBLEService *pService = NULL;
NimBLECharacteristic *pWriteCharacteristic = NULL;
NimBLECharacteristic *pReadCharacteristic = NULL;
NimBLEDescriptor *pDescriptor = NULL;

BLEServer *pServer;

std::queue<String> BT_queue;
bool BT_flag = false;

void clearRect(uint16_t x, uint16_t y, uint16_t width, uint16_t height)
{
    for (uint16_t i = x; i < x + width; i++)
    {
        for (uint16_t j = y; j < y + height; j++)
        {
            display.clearPixel(i, j);
        }
    }
}

int last_display_update = 0;
int last_rx_indicator = 0;
bool rx_pixel = false;
bool show_debug = false;
String content = "";
void updateDisplay(String new_content)
{
    content = new_content;
    clearRect(0, 0, 128, 64);
    display.drawString(0, 0, ((String)heltec_battery_percent() + "%"));
    if (BT_connected)
    {
        display.drawString(50, 0, "BT:O");
    }
    else
    {
        display.drawString(50, 0, "BT:X");
    }
    if (gps.location.isValid())
    {
        display.drawString(96, 0, "GPS:O");
    }
    else
    {
        display.drawString(96, 0, "GPS:X");
    }
    display.drawHorizontalLine(0, 12, 128);
    display.drawStringMaxWidth(0, 14, 128, "Listening for signals...");

    if (show_debug)
    {
        display.drawStringMaxWidth(0, 26, 128, "DEVICE ID: " + (String)DEVICE_ADDR);
        display.drawStringMaxWidth(0, 38, 128, "DEVICE TYPE: Rescuer");
        display.drawStringMaxWidth(0, 50, 128, "BT: " + (String)ADVERT_NAME);
    }
    else
    {
        display.drawStringMaxWidth(0, 26, 128, content);
    }
    if (rx_pixel)
    {
        display.fillRect(123, 59, 5, 5);
    }
    display.display();
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

class ServerCallbacks : public NimBLEServerCallbacks
{
    void onConnect(NimBLEServer *pServer, NimBLEConnInfo &connInfo) override
    {
        pServer->updateConnParams(connInfo.getConnHandle(), 24, 48, 0, 180);
        pServer->getAdvertising()->stop();
        BT_connected = true;
        updateDisplay(content);

        while (!BT_queue.empty())
        {
            pWriteCharacteristic->setValue(BT_queue.front());
            pWriteCharacteristic->notify();
            delay(10);
            BT_queue.pop();
        }
    }
    void onDisconnect(NimBLEServer *pServer, NimBLEConnInfo &connInfo, int reason) override
    {
        NimBLEDevice::startAdvertising();
        BT_connected = false;
        updateDisplay(content);
    }
} serverCallbacks;

class CharacteristicCallbacks : public NimBLECharacteristicCallbacks
{
    void onRead(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo &connInfo) override
    {
    }
    void onWrite(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo &connInfo) override
    {
    }
    void onStatus(NimBLECharacteristic *pCharacteristic, int code) override
    {
    }
    void onSubscribe(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo &connInfo, uint16_t subValue) override
    {
    }
} chrCallbacks;

String buffer = "";
class ReadCharacteristicCallbacks : public NimBLECharacteristicCallbacks
{
    void onWrite(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo &connInfo) override
    {
        String chunk = pCharacteristic->getValue().c_str();
        buffer += chunk;
        if (buffer.endsWith("-ENDP"))
        {
            txPacket(buffer);
            buffer = "";
        }
    }
};

void setup()
{
    heltec_setup();

    pinMode(URGENCY_PIN_1, INPUT_PULLUP);
    pinMode(URGENCY_PIN_2, INPUT_PULLUP);
    pinMode(SOS_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(URGENCY_PIN_1), urgencyChanged, CHANGE);
    attachInterrupt(digitalPinToInterrupt(URGENCY_PIN_2), urgencyChanged, CHANGE);
    attachInterrupt(digitalPinToInterrupt(SOS_PIN), sosPressed, CHANGE);

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
    pReadCharacteristic = pService->createCharacteristic(READ_CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
    pDescriptor = pWriteCharacteristic->createDescriptor(DESCRIPTOR_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
    pWriteCharacteristic->setCallbacks(new CharacteristicCallbacks());
    pReadCharacteristic->setCallbacks(new ReadCharacteristicCallbacks());
    pService->start();

    NimBLEAdvertising *pAdvertising = NimBLEDevice::getAdvertising();
    pAdvertising->setName(ADVERT_NAME);
    pAdvertising->addServiceUUID(pService->getUUID());
    pAdvertising->enableScanResponse(true);
    pAdvertising->start();

    updateDisplay("Waiting to start sending location");
}

void txLocPacket()
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

    snprintf(packet, sizeof(packet), "%s1004%s62%s-%s-%s", DEVICE_ADDR, id_buffer, lat_buffer, lng_buffer, "1");
    txPacket(packet);
}

bool isFamiliarBounce(String incoming)
{
    String *p = std::find(bounced_packet_history, bounced_packet_history + BOUNCED_PACKET_HISTORY_SIZE, incoming);
    if (p == bounced_packet_history + BOUNCED_PACKET_HISTORY_SIZE)
    {
        // both.printf("New, reTx\n");
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
        // both.printf("Old, no reTx\n");
        return true;
    }
}

bool isFamiliarProcess(String incoming)
{
    String *p = std::find(packet_history, packet_history + PACKET_HISTORY_SIZE, incoming);
    if (p == packet_history + PACKET_HISTORY_SIZE)
    {
        // both.printf("New, process\n");
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
        // both.printf("Old, ignore\n");
        return true;
    }
}

bool tx_loc_flag = false;

void processPayload(char type, String data)
{
    if (type == '7')
    {
        updateDisplay("Sending location...");
        tx_loc_flag = true;
        last_tx_loc_time = millis();
        return;
    }

    const size_t maxChunkSize = 20;
    size_t payloadLen = data.length();

    for (size_t i = 0; i < payloadLen; i += maxChunkSize)
    {
        String chunk = data.substring(i, i + maxChunkSize);
        if (true)
        {
            pWriteCharacteristic->setValue((uint8_t *)chunk.c_str(), chunk.length());
            pWriteCharacteristic->notify();
        }
        else
        {
            BT_queue.push(chunk);
        }
        delay(10);
    }

    String endMarker = "-ENDP";
    if (true)
    {
        pWriteCharacteristic->setValue((uint8_t *)endMarker.c_str(), endMarker.length());
        pWriteCharacteristic->notify();
    }
    else
    {
        BT_queue.push("-ENDP");
    }
}

void loop()
{
    heltec_loop();

    if (sos_pressed)
    {
        sos_pressed = false;
        if (sos_state)
        {
            sos_pressed_start = millis();
        }
        else
        {
            int press_duration = millis() - sos_pressed_start;
            if (press_duration < 3000)
            {
                sos_flag = true;
            }
            else
            {
                show_debug = !show_debug;
                updateDisplay(content);
            }
        }
    }

    if (last_display_update + 5000 < millis())
    {
        show_debug = false;
        updateDisplay(content);
        last_display_update = millis();
    }

    while (gpsSerial.available())
    {
        gps.encode(gpsSerial.read());
    }

    if (gps.location.isUpdated())
    {
        if (last_tx_loc_time + 3000 < millis() && tx_loc_flag)
        {
            txLocPacket();
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
            String incoming = rx_data_str.substring(0, 4) + " " + rx_data_str.substring(8, 10);

            if (dst == DEVICE_ADDR || dst == "1003" || dst == "1002" || dst == "1001")
            {
                if (isFamiliarProcess(incoming) == false)
                {
                    char type = rx_data[10];
                    processPayload(type, rx_data_str);
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