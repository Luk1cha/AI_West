// types.ts

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  [key: string]: any; // სხვა კრიტერიუმებისათვის
}

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'sensor' | 'pump' | 'controller' | 'other';
  status: 'connected' | 'disconnected';
  lastSeen: string;
}
