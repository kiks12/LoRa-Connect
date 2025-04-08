#include <TinyGPS++.h>
#include <HardwareSerial.h>
// #include <Arduino.h>

TinyGPSPlus gps;

// Use Serial1 on GPIO 47 (RX) and 48 (TX)
HardwareSerial gpsSerial(1);

const char* startNames[] = {"HOT", "WARM", "COLD"};
int state = 0;     // 0 = HOT, 1 = WARM, 2 = COLD
int trial = 0;
bool waitingForFix = false;
unsigned long lastMillis = 0;


void runNextStartType() {
  gpsSerial.flush();
  if (state == 0) {
    Serial.println("HOT START testing...");
    gpsSerial.print("$PMTK101*32\r\n");
  } else if (state == 1) {
    Serial.println("WARM START testing...");
    gpsSerial.print("$PMTK102*31\r\n");
  } else if (state == 2) {
    Serial.println("COLD START testing...");
    gpsSerial.print("$PMTK103*30\r\n");
  }

  lastMillis = millis();
  waitingForFix = true;
}


void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 47, 48);
  delay(2000);

  Serial.println("=== GPS TTFF TEST ===");

  runNextStartType();  // Trigger first start type
}

void loop() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (waitingForFix && gps.location.isValid()) {
    unsigned long fixTime = millis() - lastMillis;
    Serial.print(startNames[state]);
    Serial.print(" START ");
    Serial.print(trial + 1);
    Serial.print(": ");
    Serial.print(fixTime);
    Serial.println(" ms");

    trial++;
    waitingForFix = false;

    if (trial >= 5) {
      trial = 0;
      state++;
      if (state > 2) {
        Serial.println("=== TEST COMPLETE ===");
        while (true);  // Stop program
      }
    }

    delay(3000); // Wait before next reset
    runNextStartType();
  }
}
