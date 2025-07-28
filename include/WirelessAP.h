#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiAP.h>
#include <ESPmDNS.h>

void initWiFi() {
    WiFi.softAP("esp32temp");
    MDNS.begin("esp32temp");
}