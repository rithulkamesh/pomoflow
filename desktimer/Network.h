#ifndef Network_H_
#define Network_H_
#include <WiFi.h>

class Network {
public:
  WiFiServer server;

  void StartAPMode();
  void HandleClient();
};

#endif
