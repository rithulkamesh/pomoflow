#include "Data.h"
#include <EEPROM.h>

bool Data::NetworkCredentialsPresent() { return !EEPROM.readBool(0); }

void Data::InitEEPROM() {
  if (!EEPROM.begin(EEPROM_SIZE)) {
    Serial.println("[ERROR]: failed to init EEPROM");
    while (1)
      ;
  }
}
