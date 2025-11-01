import { Platform } from 'react-native';
import type { BleManager, Device } from 'react-native-ble-plx';
import { BluetoothDevice, SensorData } from '../types';

// Conditionally import BleManager only on native platforms
let BleManagerClass: typeof BleManager | null = null;
let moduleLoadError: Error | null = null;

if (Platform.OS !== 'web') {
  try {
    console.log('[Bluetooth] Attempting to load react-native-ble-plx...');
    const BleModule = require('react-native-ble-plx');
    console.log('[Bluetooth] Module imported successfully');
    console.log('[Bluetooth] Module type:', typeof BleModule);
    console.log('[Bluetooth] Module keys:', Object.keys(BleModule || {}));
    console.log('[Bluetooth] BleManager exists?', !!BleModule?.BleManager);
    console.log('[Bluetooth] BleManager type:', typeof BleModule?.BleManager);
    
    if (BleModule && BleModule.BleManager) {
      BleManagerClass = BleModule.BleManager;
      console.log('[Bluetooth] BleManagerClass assigned successfully');
    } else {
      console.error('[Bluetooth] BleManager not found in module!');
      console.error('[Bluetooth] This means the native module is not properly linked');
    }
  } catch (error) {
    moduleLoadError = error as Error;
    console.error('[Bluetooth] Failed to load react-native-ble-plx module');
    console.error('[Bluetooth] Error:', error);
    console.error('[Bluetooth] Error message:', (error as Error).message);
    console.error('[Bluetooth] Make sure you ran: npx expo prebuild --clean && npx expo run:android');
  }
}

/**
 * BluetoothService Class
 * Manages connection, data reception, and communication with hardware controllers
 * 
 * USAGE:
 * const btService = BluetoothService.getInstance();
 * if (btService) {
 *   await btService.initialize();
 *   btService.startScanning((device) => console.log('Found:', device));
 *   btService.onSensorDataReceived((data) => processData(data));
 * }
 */
class BluetoothService {
  private static instance: BluetoothService | null = null;
  private manager: BleManager | null = null;
  private connectedDevices: Map<string, Device> = new Map();
  private sensorDataCallback?: (data: SensorData) => void;
  private isNativePlatform: boolean;

  // UUIDs for your specific hardware (replace these with actual device UUIDs)
  private readonly SERVICE_UUID = '0000180A-0000-1000-8000-00805F9B34FB';
  private readonly SENSOR_CHARACTERISTIC_UUID = '00002A58-0000-1000-8000-00805F9B34FB';

  private constructor() {
    this.isNativePlatform = Platform.OS !== 'web' && BleManagerClass !== null;
    
    // Only initialize BleManager if the native module loaded successfully
    if (this.isNativePlatform && BleManagerClass) {
      try {
        this.manager = new BleManagerClass();
        console.log('[Bluetooth] BleManager instance created');
      } catch (error) {
        console.error('[Bluetooth] Failed to create BleManager instance:', error);
        this.manager = null;
      }
    } else {
      if (Platform.OS === 'web') {
        console.warn('[Bluetooth] Bluetooth functionality is not available on web platform');
      } else if (moduleLoadError) {
        console.error('[Bluetooth] Cannot initialize - native module failed to load');
      }
    }
  }

  /** 
   * Singleton - returns null if Bluetooth is not available
   * Always check if the return value is null before using
   */
  public static getInstance(): BluetoothService | null {
    // Return null if native module isn't available
    if (Platform.OS === 'web' || !BleManagerClass) {
      console.warn('[Bluetooth] getInstance called but Bluetooth is not available on this platform');
      return null;
    }

    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
      
      // If initialization failed, return null
      if (!BluetoothService.instance.manager) {
        console.error('[Bluetooth] Failed to create working instance');
        BluetoothService.instance = null;
        return null;
      }
    }
    
    return BluetoothService.instance;
  }

  /** Check if platform supports Bluetooth */
  private checkPlatformSupport(): boolean {
    if (!this.isNativePlatform || !this.manager) {
      console.warn('[Bluetooth] Operation not supported - manager not available');
      return false;
    }
    return true;
  }

  /** Initialize Bluetooth */
  public async initialize(): Promise<boolean> {
    if (!this.checkPlatformSupport()) return false;

    try {
      const state = await this.manager!.state();
      console.log('[Bluetooth] Current state:', state);
      if (state !== 'PoweredOn') {
        console.warn('[Bluetooth] Bluetooth is not powered on');
        return false;
      }
      return true;
    } catch (error) {
      console.error('[Bluetooth] Initialization error:', error);
      return false;
    }
  }

  /** Start scanning for nearby devices */
  public startScanning(
    onDeviceFound: (device: BluetoothDevice) => void,
    durationMs: number = 10000
  ): void {
    if (!this.checkPlatformSupport()) return;

    console.log('[Bluetooth] Starting device scan...');
    this.manager!.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('[Bluetooth] Scan error:', error);
        return;
      }

      if (device && device.name) {
        // Filter for specific devices
        if (device.name.includes('HA-') || device.name.includes('Hazelnut')) {
          const btDevice: BluetoothDevice = {
            id: device.id,
            name: device.name,
            type: this.detectDeviceType(device.name),
            status: 'disconnected',
            lastSeen: new Date().toISOString(),
          };
          console.log('[Bluetooth] Found device:', btDevice);
          onDeviceFound(btDevice);
        }
      }
    });

    setTimeout(() => this.stopScanning(), durationMs);
  }

  /** Stop scanning */
  public stopScanning(): void {
    if (!this.checkPlatformSupport()) return;
    
    this.manager!.stopDeviceScan();
    console.log('[Bluetooth] Scanning stopped');
  }

  /** Connect to a device */
  public async connectToDevice(deviceId: string): Promise<boolean> {
    if (!this.checkPlatformSupport()) return false;

    try {
      console.log('[Bluetooth] Connecting to device:', deviceId);
      const device = await this.manager!.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevices.set(deviceId, device);
      console.log('[Bluetooth] Connected successfully');

      this.monitorSensorData(device);
      return true;
    } catch (error) {
      console.error('[Bluetooth] Connection error:', error);
      return false;
    }
  }

  /** Monitor sensor characteristic */
  private monitorSensorData(device: Device): void {
    if (!this.checkPlatformSupport()) return;

    device.monitorCharacteristicForService(
      this.SERVICE_UUID,
      this.SENSOR_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('[Bluetooth] Monitor error:', error);
          return;
        }

        if (characteristic?.value) {
          const jsonString = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          try {
            const sensorData: SensorData = JSON.parse(jsonString);
            console.log('[Bluetooth] Received sensor data:', sensorData);
            if (this.sensorDataCallback) {
              this.sensorDataCallback(sensorData);
            }
          } catch (parseError) {
            console.error('[Bluetooth] JSON parse error:', parseError);
          }
        }
      }
    );
  }

  /** Register callback for sensor data */
  public onSensorDataReceived(callback: (data: SensorData) => void): void {
    this.sensorDataCallback = callback;
  }

  /** Disconnect device */
  public async disconnectDevice(deviceId: string): Promise<void> {
    if (!this.checkPlatformSupport()) return;

    const device = this.connectedDevices.get(deviceId);
    if (device) {
      await device.cancelConnection();
      this.connectedDevices.delete(deviceId);
      console.log('[Bluetooth] Disconnected from:', deviceId);
    }
  }

  /** Get all connected devices */
  public getConnectedDevices(): Device[] {
    return Array.from(this.connectedDevices.values());
  }

  /** Detect device type */
  private detectDeviceType(name: string): 'sensor' | 'pump' | 'controller' | 'other' {
    if (name.includes('SENS')) return 'sensor';
    if (name.includes('PUMP')) return 'pump';
    if (name.includes('CTRL')) return 'controller';
    return 'other';
  }

  /** Send command to device */
  public async sendCommand(deviceId: string, command: string): Promise<boolean> {
    if (!this.checkPlatformSupport()) return false;

    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        console.error('[Bluetooth] Device not connected');
        return false;
      }

      const commandBase64 = Buffer.from(command).toString('base64');
      await device.writeCharacteristicWithResponseForService(
        this.SERVICE_UUID,
        this.SENSOR_CHARACTERISTIC_UUID,
        commandBase64
      );

      console.log('[Bluetooth] Command sent:', command);
      return true;
    } catch (error) {
      console.error('[Bluetooth] Command error:', error);
      return false;
    }
  }

  /** Check if Bluetooth is available on this platform */
  public isAvailable(): boolean {
    return this.isNativePlatform && this.manager !== null;
  }

  /** Get error information if module failed to load */
  public static getLoadError(): string | null {
    if (moduleLoadError) {
      return `Native module load error: ${moduleLoadError.message}`;
    }
    if (Platform.OS === 'web') {
      return 'Bluetooth is not available on web platform';
    }
    if (!BleManagerClass) {
      return 'BleManager class not available. Run: npx expo prebuild && npx expo run:android';
    }
    return null;
  }
}

export default BluetoothService;