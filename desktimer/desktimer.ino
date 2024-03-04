// addr 0 stores if device has been initialized with an ssid/password
// SSID is stored from addresses 2-33
// PASSWORD is stored from 34-97
#define SSID_SIZE 32
#define PASSWORD_SIZE 63
// 63+32+1(creds present)
#define EEPROM_SIZE 100

#include <WiFi.h>
#include <EEPROM.h>
#include <string.h>

int addr = 0;
bool ap_mode;
String PASSWORD = "";
WiFiServer server(80);
String SSID = "Pomoflow";

void setup() {
    Serial.begin(115200);
    Serial.println("[INFO]: intializing pomoflow");

    if (!EEPROM.begin(EEPROM_SIZE)) {
        Serial.println("[ERROR]: failed to init EEPROM");
        while(1);
    }

    // Every address is 255 by default, so set to 0 when network creds are present.
    // If credentials don't exist, start in Access Point (AP) mode
    if(!EEPROM.readBool(0)) {
          Serial.println("[INFO]: network credentials not found, starting in AP mode");
          ap_mode = true;
          WiFi.softAP(SSID, PASSWORD);
          IPAddress IP = WiFi.softAPIP();
          server.begin();
    }
}

void loop() {}
