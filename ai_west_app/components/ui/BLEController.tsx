import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, PermissionsAndroid, Platform, Text, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

export default function BLEController() {
  const bleManagerRef = useRef<BleManager | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initializeBLE();

    return () => {
      if (bleManagerRef.current) {
        bleManagerRef.current.destroy();
      }
    };
  }, []);

  const initializeBLE = async () => {
    try {
      // Request permissions first on Android
      if (Platform.OS === 'android') {
        const granted = await requestAndroidPermissions();
        if (!granted) {
          Alert.alert('Error', 'Bluetooth permissions are required');
          return;
        }
      }

      // Initialize BLE Manager
      bleManagerRef.current = new BleManager();

      // Wait for Bluetooth to be ready
      const subscription = bleManagerRef.current.onStateChange((state) => {
        console.log('BLE State:', state);
        
        if (state === 'PoweredOn') {
          scanAndConnect();
          subscription.remove();
        } else if (state === 'PoweredOff') {
          Alert.alert('Bluetooth', 'Please enable Bluetooth');
        }
      }, true);

    } catch (error) {
      console.error('BLE initialization error:', error);
      Alert.alert('Error', `Failed to initialize BLE: ${error}`);
    }
  };

  const requestAndroidPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === 'granted';
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const scanAndConnect = async () => {
    if (!bleManagerRef.current || isScanning) return;

    setIsScanning(true);
    console.log('Starting scan for MyESP32...');

    // Set timeout to stop scanning after 30 seconds
    const scanTimeout = setTimeout(() => {
      bleManagerRef.current?.stopDeviceScan();
      setIsScanning(false);
      console.log('Scan timeout - device not found');
      Alert.alert('Not Found', 'MyESP32 device not found. Make sure it is powered on and nearby.');
    }, 30000);

    bleManagerRef.current.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        console.error('Scan error:', error);
        clearTimeout(scanTimeout);
        setIsScanning(false);
        return;
      }

      // Filter by device name
      if (scannedDevice?.name === 'MyESP32') {
        console.log('Found MyESP32!');
        bleManagerRef.current?.stopDeviceScan();
        clearTimeout(scanTimeout);
        setIsScanning(false);

        try {
          console.log('Connecting to device...');
          const connectedDevice = await scannedDevice.connect();
          
          console.log('Discovering services...');
          await connectedDevice.discoverAllServicesAndCharacteristics();
          
          setDevice(connectedDevice);
          console.log('Connected to', connectedDevice.name);
          Alert.alert('Success', 'Connected to MyESP32');

          // Monitor disconnection
          connectedDevice.onDisconnected((error, disconnectedDevice) => {
            console.log('Device disconnected:', error);
            setDevice(null);
            setIsOn(false);
            Alert.alert('Disconnected', 'Device was disconnected');
          });

        } catch (err) {
          console.error('Connection error:', err);
          Alert.alert('Connection Failed', `Could not connect: ${err}`);
        }
      }
    });
  };

  const togglePower = async () => {
    if (!device) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    // Replace these with your actual UUIDs from ESP32
    const serviceUUID = '0000xxxx-0000-1000-8000-00805f9b34fb';
    const characteristicUUID = '0000yyyy-0000-1000-8000-00805f9b34fb';

    const value = isOn ? '0' : '1';

    try {
      // Convert string to base64
      const base64Value = Buffer.from(value, 'utf-8').toString('base64');
      
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Value
      );
      
      setIsOn(!isOn);
      console.log('Power toggled:', !isOn ? 'ON' : 'OFF');
      
    } catch (err) {
      console.error('Write error:', err);
      Alert.alert('Error', `Failed to send command: ${err}`);
    }
  };

  const reconnect = () => {
    setDevice(null);
    setIsOn(false);
    scanAndConnect();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Power Status: {isOn ? 'ON' : 'OFF'}
      </Text>
      
      <Button 
        title={isOn ? 'Turn Off' : 'Turn On'} 
        onPress={togglePower}
        disabled={!device}
      />
      
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Device: {device ? device.name : isScanning ? 'Scanning...' : 'Not connected'}
        </Text>
        
        {!device && !isScanning && (
          <Button title="Scan & Connect" onPress={scanAndConnect} />
        )}
        
        {device && (
          <Button title="Disconnect & Reconnect" onPress={reconnect} color="orange" />
        )}
      </View>
    </View>
  );
}