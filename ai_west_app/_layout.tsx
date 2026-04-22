import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ეს ჰედერს მალავს
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      {/* აქ შეგიძლია დაამატო სხვა სკრინებიც */}
    </Stack>
  );
}
