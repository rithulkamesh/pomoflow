#include "Data.h"
#include "Network.h"

Data *data = new Data();
Network *network = new Network();

void setup() {
    Serial.begin(115200);
    Serial.println("[INFO]: intializing pomoflow");

    data->InitEEPROM();
    if(!data->NetworkCredentialsPresent()) {
         Serial.println("[INFO]: network credentials not found, starting in AP mode");
         network->StartAPMode();
    }
}

void loop() {
    network->HandleClient();
}
