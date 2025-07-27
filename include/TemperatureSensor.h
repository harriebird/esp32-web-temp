#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMPERATURE_PIN 15

OneWire temperatureOneWire(TEMPERATURE_PIN);
DallasTemperature temperatureSensor(&temperatureOneWire);

void initTemperatureSensor() {
    temperatureSensor.begin();
}

float getTemperature() {
    temperatureSensor.requestTemperatures();
    return temperatureSensor.getTempCByIndex(0);
}