# 🌱 AI-WEST: Smart Garden IoT System

**A Hackathon Project** — Smart garden monitoring and automated irrigation control using IoT sensors, ESP32 microcontroller, and mobile app powered by React Native & Firebase.

![Status](https://img.shields.io/badge/Status-Hackathon%20(Complete)-blue)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Project Overview

AI-WEST is an intelligent garden monitoring system that measures environmental conditions (temperature, humidity, soil moisture, light) and automatically controls irrigation based on AI-driven recommendations. The system combines hardware sensors, cloud services, and machine learning for optimal plant care.

### ✨ Key Features

- **Real-time Sensor Monitoring**: Track soil moisture, air temperature, humidity, and light levels
- **Smart Watering**: AI-powered automated irrigation control
- **Mobile Dashboard**: Cross-platform app (iOS, Android, Web)
- **Cloud Sync**: Firebase real-time database
- **WIFI**: Direct ESP32 device communication
- **Community Forum**: Share gardening experiences
- **Data Analytics**: Export sensor data for analysis

## 🏆 Hackathon Team

| Role | Name |
|------|------|
| 🔌 IoT Engineer | Luka Alaverdashvili |
| 🌾 Agronomist & Business Process Manager | Erekle Ebralidze |
| 🔧 IoT Engineer | Dato Svanidze |
| 🧑‍💻 Software Developer | Mate Levidze |
| 📊 Marketing & Business Process Manager | Nika Tugushi |

## 🏗️ Project Structure

```
ai_west/
├── ai_west_app/                    # React Native Mobile App (Expo)
│   ├── app/                        # Expo Router screens
│   │   ├── index.tsx              # Home dashboard
│   │   ├── controller.tsx         # Device control
│   │   ├── forum.tsx              # Community forum
│   │   ├── excel.tsx              # Data export
│   │   └── ჩემი ბაղი.tsx          # Garden management
│   ├── components/                # Reusable UI components
│   ├── services/                  # Business logic
│   │   ├── firebase*.ts           # Firebase integration
│   │   └── AIService.tsx          # AI recommendations
│   └── package.json
│
└── ai_west_ESP32_code/            # ESP32 Microcontroller Firmware
    ├── src/
    │   └── main.cpp               # Sensor & control logic
    └── platformio.ini
```

## 🚀 Quick Start

### Prerequisites
- **Mobile App**: Node.js 18+, npm, Expo CLI
- **ESP32**: PlatformIO IDE
- **Firebase**: Active project with credentials

### Mobile App

```bash
cd ai_west_app
npm install
npm start
```

### ESP32 Firmware

```bash
cd ai_west_ESP32_code
# Open in VS Code with PlatformIO extension
# Configure environment: esp32dev
# Build and upload
```

### Backend Server (Development)

```bash
cd ai_west_app
node server.js   # Runs on http://localhost:3000
```

## 📦 Tech Stack

### Mobile App
- **React Native 19** — Cross-platform framework
- **Expo 54** — Development platform
- **TypeScript** — Type safety
- **Firebase** — Authentication & database
- **NativeWind** — Tailwind CSS for React Native
- **react-native-ble-plx** — Bluetooth communication

### Hardware
- **ESP32** — Microcontroller with WiFi/Bluetooth
- **Sensors**: DHT (temperature/humidity), soil moisture, light
- **Relay control** for water pump

## 🔐 Security Notes

⚠️ **Before publishing:**
- Use `.env.example` template for Firebase config
- Never commit `.env` files


## 📱 App Screens

- **Home**: Real-time sensor dashboard
- **My Garden** (ჩემი ბაղი): Garden details and management
- **Controller**: Device control interface
- **Forum**: Community discussions
- **Excel Export**: Historical data analysis


## 📊 Sensor Data Points

- **Temperature** — Air temperature (°C)
- **Humidity** — Air humidity (%)
- **Soil Moisture** — Soil water level (%)
- **Light Level** — Ambient light intensity (Lux)

## 🤖 AI System

The app analyzes sensor data to determine:
- Optimal watering frequency
- Best time to water
- Plant health predictions
- Irrigation recommendations

## 📖 Documentation

For detailed information, see:
- [Contributors](CONTRIBUTORS.md) — Team members and roles
- [Presentation Notes](PRESENTATION.md) — Project details
- [Environment Setup](.env.example) — Configuration template

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with **Expo** and **React Native**
- Powered by **Firebase**
- ESP32 firmware with **PlatformIO**
- Special thanks to the hackathon organizers and team members

## 📝 Note on Project Status

**This is a completed Hackathon project.** It is not actively maintained and will not receive new features or upgrades. The code is published as-is for educational and reference purposes.

---

**Created by the AI-WEST Hackathon Team** 🌱

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for team member details.
