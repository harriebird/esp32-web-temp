#include <TemperatureSensor.h>
#include <LittleFS.h>
#include <PsychicHttp.h>


PsychicHttpServer webServer;
PsychicWebSocketHandler webSocketHandler;
float externalTemperature = 0;
float internalTemperature = 0;

void initWebapp() {
    LittleFS.begin();
    webServer.listen(80);
    initTemperatureSensor();

    webSocketHandler.onOpen([](PsychicWebSocketClient *client) {
        client->sendMessage("success");
    });

    webSocketHandler.onFrame([](PsychicWebSocketRequest *request, httpd_ws_frame *frame) {
        const String message = reinterpret_cast<char *>(frame->payload);
        if (message == "get_temp") {
            internalTemperature = temperatureRead();
            externalTemperature = getTemperature();
            String payload = "";
            payload.concat("{\"internal\": " + String(internalTemperature));
            payload.concat(", \"external\": "+ String(externalTemperature) + "}");
            return request->reply(payload.c_str());
        }
        return request->reply("not_found");
    });

    webServer.on("/socket", &webSocketHandler);
    webServer.serveStatic("/", LittleFS, "/frontend/")->setDefaultFile("index.html");

}