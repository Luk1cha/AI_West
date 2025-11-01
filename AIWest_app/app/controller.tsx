import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
}

const ESP32_IP = "192.168.1.5:3000"; // ESP32 AP IP

export default function Controller() {
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
  });
  const [waterOn, setWaterOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [waterAmount, setWaterAmount] = useState(500); // წინა სვლა: 500ml

  // სენსორების წაკითხვა 
  const fetchSensorData = async () => {
    try {
      const res = await fetch(`http://${ESP32_IP}/sensor`);
      const data = await res.json();
      setSensorData({
        soilMoisture: data.soilMoisture,
        temperature: data.temperature,
        humidity: data.humidity,
      });
      setConnected(true);
    } catch (error) {
      console.error("Sensor fetch error:", error);
      setConnected(false);
    }
  };

  // წყლის კონტროლი მოცულობით
  const startWatering = async (amountMl: number) => {
    try {
      await fetch(`http://${ESP32_IP}/water?amount=${amountMl}`, { method: "POST" });
      setWaterOn(true);
      // ავტომატური გამორთვა (მაგალითად 1ml ≈ 1 წამი, თუ ESP32–ზე დრო არ აკონტროლებს)
      setTimeout(() => setWaterOn(false), amountMl * 1000);
    } catch (error) {
      console.error("Water toggle error:", error);
      Alert.alert("შეცდომა", "წყლის კონტროლი ვერ შესრულდა");
    }
  };

  useEffect(() => {
    fetchSensorData(); // პირველი წაკითხვა
    const interval = setInterval(fetchSensorData, 5000); // 5 წამში ერთხელ
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>კონტროლი 🌿</Text>
            <Text style={styles.headerSubtitle}>Wi-Fi მენეჯმენტი</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="wifi" size={24} color="white" />
          </View>
        </View>

        {/* Connection Status */}
        <View style={[styles.connectionBadge, { backgroundColor: connected ? '#d1fae5' : '#fee2e2' }]}>
          <View style={styles.connectionBadgeLeft}>
            <Ionicons 
              name="wifi" 
              size={20} 
              color={connected ? '#065f46' : '#991b1b'} 
            />
            <View style={styles.connectionInfo}>
              <Text style={[styles.connectionStatusText, { color: connected ? '#065f46' : '#991b1b' }]}>
                {connected ? 'კავშირია' : 'არ არის კავშირი'}
              </Text>
              <Text style={[styles.connectionSignalText, { color: connected ? '#2563eb' : '#dc2626' }]}>
                {connected ? 'ESP32 AP' : 'დაკავშირდით Wi-Fi AP-სთან'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Live Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 სენსორები</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Ionicons name="water" size={24} color="#10b981" />
              <Text style={styles.sensorLabel}>მიწის ტენიანობა</Text>
              <Text style={[styles.sensorValue, { color: '#10b981' }]}>{sensorData.soilMoisture}%</Text>
            </View>
            <View style={styles.sensorCard}>
              <Ionicons name="thermometer" size={24} color="#f59e0b" />
              <Text style={styles.sensorLabel}>ტემპერატურა</Text>
              <Text style={[styles.sensorValue, { color: '#f59e0b' }]}>{sensorData.temperature}°C</Text>
            </View>
            <View style={styles.sensorCard}>
              <Ionicons name="cloud" size={24} color="#3b82f6" />
              <Text style={styles.sensorLabel}>ტენიანობა</Text>
              <Text style={[styles.sensorValue, { color: '#3b82f6' }]}>{sensorData.humidity}%</Text>
            </View>
          </View>
        </View>

        {/* Water Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💧 წყლის კონტროლი</Text>
          <View style={styles.deviceCard}>
            <View style={[styles.deviceIconContainer, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="water" size={28} color="#10b981" />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>მორწყვის სისტემა</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <Text style={{ marginRight: 8 }}>რაოდენობა (ml):</Text>
                <TextInput
                  keyboardType="numeric"
                  value={waterAmount.toString()}
                  onChangeText={(val) => setWaterAmount(Number(val))}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    width: 80
                  }}
                />
              </View>

              <View style={styles.deviceControls}>
                <TouchableOpacity
                  style={[styles.deviceButton, { backgroundColor: waterOn ? '#e5e7eb' : '#10b981' }]}
                  onPress={() => startWatering(waterAmount)}
                  disabled={waterOn}
                >
                  <Ionicons name="play" size={16} color={waterOn ? '#9ca3af' : 'white'} />
                  <Text style={[styles.deviceButtonText, { color: waterOn ? '#9ca3af' : 'white' }]}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deviceButton, { backgroundColor: !waterOn ? '#e5e7eb' : '#ef4444', marginLeft: 8 }]}
                  onPress={() => setWaterOn(false)}
                  disabled={!waterOn}
                >
                  <Ionicons name="stop" size={16} color={!waterOn ? '#9ca3af' : 'white'} />
                  <Text style={[styles.deviceButtonText, { color: !waterOn ? '#9ca3af' : 'white' }]}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        {sensorData.soilMoisture > 0 && sensorData.soilMoisture < 50 && (
          <View style={styles.alertCard}>
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>დაბალი ნიადაგის ტენიანობა</Text>
              <Text style={styles.alertMessage}>
                ნიადაგის ტენიანობა 50%-ზე დაბალია. განიხილეთ მორწყვის აქტივაცია.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: { backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  connectionBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12 },
  connectionBadgeLeft: { flexDirection: 'row', alignItems: 'center' },
  connectionInfo: { marginLeft: 8 },
  connectionStatusText: { fontWeight: 'bold', fontSize: 12 },
  connectionSignalText: { fontSize: 12 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sensorCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, width: '31%', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  sensorLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  sensorValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  section: { marginBottom: 20 },
  deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  deviceIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  deviceControls: { flexDirection: 'row', marginTop: 8 },
  deviceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  deviceButtonText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  alertCard: { flexDirection: 'row', backgroundColor: '#fff7ed', padding: 16, borderRadius: 16, marginTop: 20 },
  alertContent: { marginLeft: 12, flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#b45309' },
  alertMessage: { fontSize: 12, color: '#78350f', marginTop: 4 },
});
