

## ESP32 Plant Monitoring System - Detailed Wiring Connections

### **Component List:**
1. ESP32 DevKit (main microcontroller)
2. DHT11 Temperature & Humidity Sensor
3. LDR (Light Dependent Resistor) with 10kΩ resistor
4. YL-69 Soil Moisture Sensor Module
5. 5V Water Pump with Relay Module
6. LED with 220Ω resistor
7. External 5V Power Supply (for pump)
8. Breadboard and jumper wires

---

### **Detailed Pin Connections:**

#### **1. DHT11 Temperature & Humidity Sensor:**
- **DHT11 VCC** → **ESP32 3.3V** (red wire)
- **DHT11 DATA** → **ESP32 GPIO 4** (green wire)
- **DHT11 GND** → **ESP32 GND** (black wire)

**Notes:** DHT11 has 3 pins. Some modules have built-in pull-up resistor. If using bare sensor, add 10kΩ pull-up resistor between DATA and VCC.

---

#### **2. LDR (Light Sensor):**
- **LDR Pin 1** → **ESP32 3.3V** (red wire)
- **LDR Pin 2** → **ESP32 GPIO 34** (yellow wire) AND **10kΩ resistor to GND**
- **10kΩ Resistor** → **ESP32 GND** (black wire)

**Notes:** This creates a voltage divider. GPIO 34 is an ADC pin (analog input only). The LDR and resistor form a voltage divider circuit.

---

#### **3. YL-69 Soil Moisture Sensor Module:**
- **YL-69 VCC** → **ESP32 5V** or external 5V supply (red wire)
- **YL-69 A0 (Analog Out)** → **ESP32 GPIO 35** (orange wire)
- **YL-69 GND** → **ESP32 GND** (black wire)

**Notes:** GPIO 35 is an ADC pin (analog input only). The YL-69 module typically has both analog (A0) and digital (D0) outputs - we're using analog.

---

#### **4. Water Pump with Relay Module:**
- **Relay VCC** → **External 5V Power Supply +** (red wire)
- **Relay IN (Signal)** → **ESP32 GPIO 26** (blue wire)
- **Relay GND** → **ESP32 GND** AND **External 5V Power Supply -** (black wire, common ground)
- **Pump +** → **Relay COM (Common)**
- **Pump -** → **External 5V Power Supply -**
- **Relay NO (Normally Open)** → **External 5V Power Supply +**

**Notes:** The relay is powered by external 5V supply, not ESP32, because motors draw too much current. GPIO 26 is a digital output pin that controls the relay. When GPIO 26 is HIGH, relay closes and pump runs.

---

#### **5. Status LED:**
- **LED Anode (+, longer leg)** → **220Ω resistor** → **ESP32 GPIO 12** (green wire)
- **LED Cathode (-, shorter leg)** → **ESP32 GND** (black wire)

**Notes:** GPIO 12 is a digital output pin. The 220Ω resistor limits current to protect the LED. LED blinks briefly when data is successfully sent to Firebase.

---

### **Power Distribution:**

#### **ESP32 Power:**
- **ESP32 VIN** → **USB 5V** or **External 5V Power Supply**
- **ESP32 GND** → **Common Ground Rail** (all grounds tied together)

#### **Sensors Power:**
- **DHT11** → 3.3V from ESP32 (low current sensor)
- **LDR** → 3.3V from ESP32 (low current sensor)
- **YL-69** → 5V (can use ESP32 5V pin or external supply)

#### **Motor/Pump Power:**
- **Water Pump** → **External 5V Power Supply** (1A or higher)
- **Relay Module** → **External 5V Power Supply**

**IMPORTANT:** All GND connections must be tied together (common ground) including ESP32 GND, sensor GNDs, relay GND, and external power supply GND.

---

### **Summary Table:**

| Component | Pin     | ESP32 GPIO     | Wire Color | Notes                 |
|-----------|---------|----------------|------------|-----------------------|
| DHT11     | VCC     | 3.3V           | Red        | Temperature/Humidity  |
| DHT11     | DATA    | GPIO 4         | Green      | Digital communication |
| DHT11     | GND     | GND            | Black      | Ground                |
| LDR       | VCC     | 3.3V           | Red        | Light sensor          |
| LDR       | OUT     | GPIO 34        | Yellow     | Analog input (ADC)    |
| LDR       | GND     | GND (via 10kΩ) | Black      | Voltage divider       |
| YL-69     | VCC     | 5V             | Red        | Soil moisture         |
| YL-69     | A0      | GPIO 35        | Orange     | Analog input (ADC)    |
| YL-69     | GND     | GND            | Black      | Ground                |
| Relay     | VCC     | Ext 5V+        | Red        | Motor control         |
| Relay     | IN      | GPIO 26        | Blue       | Digital output        |
| Relay     | GND     | GND            | Black      | Common ground         |
| LED       | Anode   | GPIO 12        | Green      | Status indicator      |
| LED       | Cathode | GND (via 220Ω) | Black      | Via 220Ω resistor     |

---

### **GPIO Pin Summary:**
- **GPIO 4** - DHT11 Data (Digital I/O)
- **GPIO 12** - Status LED (Digital Output)
- **GPIO 26** - Motor Relay Control (Digital Output)
- **GPIO 34** - LDR Light Sensor (Analog Input, ADC1)
- **GPIO 35** - YL-69 Soil Moisture (Analog Input, ADC1)

