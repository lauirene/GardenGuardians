#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHAR_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEServer *pServer = nullptr;
BLECharacteristic *pTxCharacteristic = nullptr;





#define HALLEFFECT_INPUT_PIN A0
#define BUZZER_PIN 12
bool magnetDetected = false;
bool connected = false;

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    connected = true;
    Serial.println("Client connected");
  }
  void onDisconnect(BLEServer* pServer) {
    connected = false;
    pServer->getAdvertising()->start();
    Serial.println("Client disconnected, restarted advertising");
  }
};

void setup() {
  Serial.begin(115200);
  delay(1000);
  BLEDevice::init("MyESP32");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pTxCharacteristic = pService->createCharacteristic(
    CHAR_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();


  pinMode(HALLEFFECT_INPUT_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  int hallEffectVal = analogRead(HALLEFFECT_INPUT_PIN);

  Serial.println(connected);
  if(hallEffectVal >= 2300 && !magnetDetected){
    Serial.println("Cut");
    pTxCharacteristic->setValue("Cut\n");
    pTxCharacteristic->notify();
    tone(BUZZER_PIN, 1000, 100);
    magnetDetected = true;
  }
  else if (hallEffectVal < 2300){
    if (magnetDetected) {
      Serial.println("Open");
      pTxCharacteristic->setValue("Open\n");
      pTxCharacteristic->notify();
    }
    magnetDetected = false;
  }
  // Serial.println(hallEffectVal);

  delay(50);
}
