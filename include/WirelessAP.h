#include <WiFi.h>
#include <WiFiAP.h>
#include <ESPmDNS.h>

void initWiFi() {
    WiFi.softAP("esp32temp", NULL);
    MDNS.begin("esp32temp");
}