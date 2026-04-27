#include <Arduino.h>
#include <secrets.h>
#define FIREBASE_DISABLE_FB_STORAGE
#define FIREBASE_DISABLE_FIRESTORE
#define FIREBASE_DISABLE_FCM

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// Provide the token generation process info
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions
#include "addons/RTDBHelper.h"

// Sensor pins
#define LDR_PIN 34         // j22
#define YL69_PIN 35        // YL-69 ანალოგური PIN  j27
#define DHT_PIN 4          // DHT11 PIN (შეგიძლია შეცვალო)  a22
#define MOTOR_IN 26       // Motor on/off pin


#define MOTOR_RUN_TIME 3000 // Run motor for 3 seconds
#define MOISTURE_THRESHOLD 60 // Start motor if moisture is below this

#define LED_PIN 12 //LED Pin

// DHT sensor configuration
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
bool MotorRunning = false;
unsigned long motorStartTime = 0;
// int moisturePercent = 25;

void setupMotor() {
  pinMode(MOTOR_IN, OUTPUT);
  
  // Stop motor initially
  digitalWrite(MOTOR_IN, LOW);
}

void startMotor() {
  if (!MotorRunning) {
    Serial.println("🌊 Starting water pump...");
    digitalWrite(MOTOR_IN, HIGH);
    MotorRunning = true;
    motorStartTime = millis();
    // moisturePercent = moisturePercent + 5; // Simulate moisture increase for testing
  }
}

void stopMotor() {
  if (MotorRunning) {
    Serial.println("🛑 Stopping water pump");
    digitalWrite(MOTOR_IN, LOW);
    MotorRunning = false;
  }
}

void checkMotorTimer() {
  if (MotorRunning && (millis() - motorStartTime >= MOTOR_RUN_TIME)) {
    stopMotor();
  }
}

void LedBlink(){
  digitalWrite(LED_PIN, HIGH);
  delay(50);
  digitalWrite(LED_PIN, LOW);
}

void WiFiConnect() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("✓ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  pinMode(LDR_PIN, INPUT);
  pinMode(YL69_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

   // Initialize motor
  setupMotor();
  
  Serial.println("Starting...");
  
  // Initialize DHT sensor
  dht.begin();
  
  Serial.println("Starting...");
  
  // Connect WiFi
  WiFiConnect();
  
  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Sign up anonymously
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✓ Anonymous sign-up successful");
    signupOK = true;
  } else {
    Serial.printf("Sign-up error: %s\n", config.signer.signupError.message.c_str());
  }
  
  // Assign the callback function for token generation
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("✓ Firebase Ready!");
}

void loop() {
  // Check if motor needs to be stopped
  // checkMotorTimer();
   if(WiFi.status() != WL_CONNECTED){
    Serial.println("⚠️  WiFi disconnected, trying to reconnect...");
    WiFiConnect();
  }

  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 2000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    // Read LDR sensor
    int lightValueAnalog = analogRead(LDR_PIN);
    int lightValue = map(lightValueAnalog, 4095, 0, 100, 0);
    
    // // Read YL-69 soil moisture sensor
    int soilMoisture = analogRead(YL69_PIN);
    // გადაიყვანე პროცენტებში (4095 = მშრალი, 0 = სველი)
    int moisturePercent = map(soilMoisture, 4095, 0, 0, 100);
    
    // Read DHT11 sensor
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Check if DHT reading failed
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("✗ DHT11 reading failed!");
      temperature = -999;  // Error value
      humidity = -999;
    }

    // Check soil moisture and control motor
    // if (moisturePercent < MOISTURE_THRESHOLD && !MotorRunning) {
    //   Serial.print("⚠️  Soil too dry (");
    //   Serial.print(moisturePercent);
    //   Serial.println("%)");
    //   startMotor();
    // }
    
    // Create JSON object
    FirebaseJson json;
    json.set("light", lightValue);
    json.set("soilMoisture", moisturePercent);
    json.set("soilMoisturePercent", moisturePercent);
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("timestamp", millis());
    json.set("device", "ESP32");
    json.set("deviceId", "001");
    
    // Send to Firebase
    if (Firebase.RTDB.setJSON(&fbdo, "/data", &json)) {
      Serial.println("✓ Data sent successfully, Noice:");
      Serial.print("  Light: ");
      Serial.println(lightValue);
      Serial.print("  Soil Moisture: ");
      Serial.print(moisturePercent);
      Serial.println("%");
      Serial.print("  Temperature: ");
      Serial.print(temperature);
      Serial.println("°C");
      Serial.print("  Humidity: ");
      Serial.print(humidity);
      Serial.println("%");
      Serial.println();
      LedBlink();
    } else {
      Serial.print("✗ Failed: ");
      Serial.println(fbdo.errorReason());
    }
  }
}