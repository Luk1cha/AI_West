import { Tabs } from "expo-router/tabs";
import { Home, Settings, User, FileSpreadsheet, MoreHorizontal,MessageSquare } from "lucide-react-native";
import React from "react";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00ff4cff",
        tabBarInactiveTintColor: "#000000ff",
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: "600", 
          fontFamily: "System",
          marginBottom: 3,
        },
        tabBarStyle: { 
          backgroundColor: "#eefdf3ff", 
          paddingBottom: 2,
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ჭკვიანი აგრონომი",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} style={{ marginBottom: -4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="ჩემი ბაღი"
        options={{
          title: "ჩემი ბაღი",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} style={{ marginBottom: -4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="controller"
        options={{
          title: "კონტროლი",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} style={{ marginBottom: -4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="excel"
        options={{
          title: "ნოუთები",
          tabBarIcon: ({ color, size }) => (
            <FileSpreadsheet color={color} size={size} style={{ marginBottom: -4 }} />
          ),
        }}
      />
      {/* More Tab */}
      <Tabs.Screen
  name="forum"
  options={{
    title: "Forum",
    tabBarIcon: ({ color, size }) => (
      <MessageSquare color={color} size={size} style={{ marginBottom: -4 }} />
    ),
  }}
/>
    </Tabs>
  );
}
