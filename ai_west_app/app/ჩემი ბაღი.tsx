import { DataSnapshot, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { dbSensor } from "../services/firebase";

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  light: number;
}

const parseSensorData = (data: any): SensorData => {
  const temp = Number(data.temperature) || 0;
  const hum = Number(data.humidity) || 0;
  const soil = Number(data.soilMoisturePercent) || 0;
  const light = Number(data.light) || 0;

  return {
    temperature: Math.max(0, Math.min(50, temp)),
    humidity: Math.max(0, Math.min(100, hum)),
    soilMoisture: Math.max(0, Math.min(100, soil)),
    light: Math.max(0, Math.min(4095, light))
  };
};

export default function MyGardenTab() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = () => {
    const sensorsRef = ref(dbSensor, "data");

    const unsubscribe = onValue(
      sensorsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val();

        if (data) {
          setSensorData(parseSensorData(data));
          setLastUpdate(new Date());
        }

        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error("Firebase error:", err);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp < 15) return "#2196F3";
    if (temp < 25) return "#4CAF50";
    if (temp < 30) return "#FF9800";
    return "#F44336";
  };

  const getHumidityColor = (humidity: number): string => {
    if (humidity < 30) return "#FFC107";
    if (humidity < 70) return "#4CAF50";
    return "#2196F3";
  };

  const getSoilMoistureColor = (moisture: number): string => {
    if (moisture < 30) return "#F44336";
    if (moisture < 60) return "#FF9800";
    return "#4CAF50";
  };

  const getLightColor = (light: number): string => {
    if (light < 500) return "#1A237E";
    if (light < 1500) return "#FFC107";
    if (light < 3000) return "#FF9800";
    return "#FFD700";
  };

  const getLightLevel = (light: number): string => {
    if (light < 500) return "ბნელი";
    if (light < 1500) return "დაბალი";
    if (light < 3000) return "საშუალო";
    return "ძლიერი";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>მონაცემების ჩატვირთვა...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
      }
    >
      <View style={styles.container}>
        <Text style={styles.title}>ჩემი ბაღი 🌱</Text>

        {sensorData && (
          <>
            <View style={styles.dataContainer}>
              <View style={[styles.dataCard, { borderLeftColor: getTemperatureColor(sensorData.temperature) }]}>
                <Text style={styles.dataIcon}>🌡</Text>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataLabel}>ტემპერატურა</Text>
                  <Text style={styles.dataValue}>{sensorData.temperature.toFixed(1)}°C</Text>
                </View>
              </View>

              <View style={[styles.dataCard, { borderLeftColor: getHumidityColor(sensorData.humidity) }]}>
                <Text style={styles.dataIcon}>💧</Text>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataLabel}>ჰაერის ნესტი</Text>
                  <Text style={styles.dataValue}>{sensorData.humidity.toFixed(0)}%</Text>
                </View>
              </View>

              <View style={[styles.dataCard, { borderLeftColor: getSoilMoistureColor(sensorData.soilMoisture) }]}>
                <Text style={styles.dataIcon}>🌱</Text>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataLabel}>მიწის ტენიანობა</Text>
                  <Text style={styles.dataValue}>{sensorData.soilMoisture.toFixed(0)}%</Text>
                </View>
              </View>

              <View style={[styles.dataCard, { borderLeftColor: getLightColor(sensorData.light) }]}>
                <Text style={styles.dataIcon}>☀️</Text>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataLabel}>სინათლის დონე</Text>
                  <Text style={styles.dataValue}>{sensorData.light}</Text>
                  <Text style={styles.dataSubValue}>{getLightLevel(sensorData.light)}</Text>
                </View>
              </View>
            </View>

            {lastUpdate && (
              <Text style={styles.timestampText}>
                ბოლო განახლება: {lastUpdate.toLocaleTimeString('ka-GE')}
              </Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, color: "#2E7D32" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  dataContainer: { width: "100%", gap: 15 },
  dataCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
  },
  dataIcon: { fontSize: 36, marginRight: 15 },
  dataInfo: { flex: 1 },
  dataLabel: { fontSize: 14, color: "#666", marginBottom: 5 },
  dataValue: { fontSize: 24, fontWeight: "bold", color: "#1B5E20" },
  dataSubValue: { fontSize: 14, color: "#888", marginTop: 2 },
  timestampText: { fontSize: 12, color: "#999", marginTop: 20, fontStyle: "italic" },
});