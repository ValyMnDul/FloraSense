#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

static const int SOIL_PIN = 34;
static const int TEMP_PIN = 4;
static const int LED_PIN = 2;

static const char* ssid = "iPhone";
static const char* password = "cacamaca";
static const char* serverUrl = "https://florasense.valymnd.me/api/sensor-data";

static const int SOIL_DRY = 3000;
static const int SOIL_WET = 1200;
static const uint32_t SENSOR_INTERVAL_MS = 30000;
static const uint32_t WIFI_RETRY_INTERVAL_MS = 5000;
static const uint16_t WIFI_CONNECT_TIMEOUT_MS = 8000;
static const uint8_t POST_RETRIES = 2;
static const uint16_t HTTP_TIMEOUT_MS = 15000;
static const uint8_t SOIL_SAMPLES = 9;
static const uint8_t WARMUP_READS_SKIP = 2;

static const float MIN_TEMP_VALID = -20.0;
static const float MAX_TEMP_VALID = 60.0;

unsigned long lastReadTime = 0;
unsigned long lastWiFiTry = 0;
uint32_t readCount = 0;
static float currentLux = 450.0;

OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);

static float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  if (in_max == in_min) return out_min;
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

static int medianAnalogRead(uint8_t pin, uint8_t n) {
  if (n < 1) n = 1;
  if (n > SOIL_SAMPLES) n = SOIL_SAMPLES;
  int v[SOIL_SAMPLES];
  for (uint8_t i = 0; i < n; i++) {
    v[i] = analogRead(pin);
    delay(5);
  }
  for (uint8_t i = 1; i < n; i++) {
    int key = v[i];
    int j = i;
    while (j > 0 && v[j - 1] > key) {
      v[j] = v[j - 1];
      j--;
    }
    v[j] = key;
  }
  return v[n / 2];
}

static bool isValidTempC(float t) {
  if (t <= -100.0f) return false;
  if (t == 85.0f) return false;
  if (t > 125.0f) return false;
  if (t < MIN_TEMP_VALID || t > MAX_TEMP_VALID) return false;
  return true;
}

static bool isValidSoil(float soilPct) {
  return soilPct >= 0.0f && soilPct <= 100.0f;
}

static void setLedConnected(bool ok) {
  digitalWrite(LED_PIN, ok ? HIGH : LOW);
}

static void wifiInit() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(false);
}

static void wifiTryConnectNonBlocking() {
  if (WiFi.status() == WL_CONNECTED) return;
  unsigned long now = millis();
  if (now - lastWiFiTry < WIFI_RETRY_INTERVAL_MS) return;
  lastWiFiTry = now;
  
  Serial.println("Incercare conectare WiFi...");
  WiFi.disconnect(true, true);
  delay(50);
  WiFi.begin(ssid, password);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_CONNECT_TIMEOUT_MS) {
    delay(200);
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi Conectat!");
    setLedConnected(true);
  } else {
    Serial.println("WiFi Timeout.");
    setLedConnected(false);
  }
}

static float readSoilMoisturePct() {
  int raw = medianAnalogRead(SOIL_PIN, SOIL_SAMPLES);
  float moisture = mapFloat((float)raw, (float)SOIL_DRY, (float)SOIL_WET, 0.0f, 100.0f);
  if (moisture < 0.0f) moisture = 0.0f;
  if (moisture > 100.0f) moisture = 100.0f;
  return moisture;
}

static float readTemperatureC() {
  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);
  if (!isValidTempC(t)) {
    return 24.5; 
  }
  return t;
}

static float simulateLightLux() {
  float variatie = random(-40, 41) / 10.0; 
  currentLux += variatie;
  if (currentLux < 350.0) currentLux = 350.0;
  if (currentLux > 600.0) currentLux = 600.0;
  return currentLux;
}

static bool sendToServerPayload(float soil, float temp, float lux) {
  if (WiFi.status() != WL_CONNECTED) return false;
  
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS);
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = "ESP32_FloraSense_01";
  doc["soil"] = soil;
  doc["temperature"] = temp;
  doc["light_lux"] = lux;
  
  String payload;
  serializeJson(doc, payload);
  
  int code = http.POST(payload);
  http.end();
  
  Serial.printf("POST Payload: %s | Status HTTP: %d\n", payload.c_str(), code);
  
  return (code >= 200 && code < 300);
}

static void readAndSendData() {
  readCount++;
  
  float soil = readSoilMoisturePct();
  float temp = readTemperatureC();
  float lux = simulateLightLux();

  Serial.printf("\n--- Citire %d ---\n", readCount);
  Serial.printf("Sol: %.1f %%\n", soil);
  Serial.printf("Temp: %.1f C\n", temp);
  Serial.printf("Lux (Simulat): %.1f lx\n", lux);
  
  if (readCount <= WARMUP_READS_SKIP) {
    Serial.println("Sarim peste primele citiri...");
    return;
  }
  
  if (!isValidSoil(soil) || !isValidTempC(temp)) {
    Serial.println("Date invalide, anulam trimiterea.");
    return;
  }
  
  for (uint8_t attempt = 0; attempt <= POST_RETRIES; attempt++) {
    Serial.printf("Trimitere date (incercarea %d)...\n", attempt + 1);
    if (sendToServerPayload(soil, temp, lux)) {
      Serial.println("Trimitere REUSITA!");
      break;
    }
    Serial.println("Eroare la trimitere, asteptam 1s...");
    delay(1000);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOIL_PIN, INPUT);

  Serial.println("\n\n=== FloraSense Cloud Node ===");
  Serial.println("Initializare Sistem...");

  tempSensor.begin();
  
  wifiInit();
  wifiTryConnectNonBlocking();
  
  lastReadTime = millis() - SENSOR_INTERVAL_MS;
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setLedConnected(false);
    wifiTryConnectNonBlocking();
  } else {
    setLedConnected(true);
  }
  
  unsigned long now = millis();
  if (now - lastReadTime >= SENSOR_INTERVAL_MS) {
    lastReadTime = now;
    readAndSendData();
  }
  
  delay(10);
}
