#include <TemperatureSensor.h>
#include <LittleFS.h>
#include <PsychicHttp.h>


PsychicHttpServer webServer;
PsychicWebSocketHandler webSocketHandler;
float temperature = 0;

void initWebapp() {
    LittleFS.begin();
    webServer.listen(80);
    // initTemperatureSensor();
    Serial.begin(115200);

    webSocketHandler.onOpen([](PsychicWebSocketClient *client) {
        client->sendMessage("success");
    });

    webSocketHandler.onFrame([](PsychicWebSocketRequest *request, httpd_ws_frame *frame) {
        const String message = reinterpret_cast<char *>(frame->payload);
        if (message == "get_temp") {
            return request->reply("25.2");
        }
        return request->reply("not_found");
    });

    webServer.on("/socket", &webSocketHandler);
    webServer.serveStatic("/", LittleFS, "/frontend/")->setDefaultFile("index.html");

}