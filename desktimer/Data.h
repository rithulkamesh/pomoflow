#ifndef Data_H_
#define Data_H_

#define SSID_SIZE 32
#define EEPROM_SIZE 100
#define PASSWORD_SIZE 63


class Data {
public:
  bool NetworkCredentialsPresent();
  void InitEEPROM();
};

#endif
