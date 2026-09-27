/**
 * Health Device & Platform Integration Layer
 * Designed to cleanly abstract hardware wearables, Google Fit,
 * Android Health Connect, and Apple Health APIs.
 */

export interface WearableDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_band' | 'chest_strap' | 'health_connect';
  connected: boolean;
  batteryLevel?: number;
  lastSyncedAt?: string;
}

export interface LiveHeartRatePacket {
  bpm: number;
  timestamp: string;
  source: string;
  restingBpm: number;
  avgBpm: number;
}

class HealthDeviceService {
  private connectedWearable: WearableDevice | null = {
    id: 'wearable-dev-01',
    name: 'Smart Band 8 (Simulated)',
    type: 'fitness_band',
    connected: true, // Default connected so user sees live demo, can be toggled
    batteryLevel: 84,
    lastSyncedAt: 'Just now',
  };

  public isConnected(): boolean {
    return this.connectedWearable !== null && this.connectedWearable.connected;
  }

  public getConnectedDevice(): WearableDevice | null {
    return this.connectedWearable;
  }

  public toggleConnection(connected: boolean): void {
    if (this.connectedWearable) {
      this.connectedWearable.connected = connected;
      this.connectedWearable.lastSyncedAt = connected ? 'Just now' : 'Disconnected';
    }
  }

  /**
   * Fetches latest reading or returns null if no hardware connected
   */
  public getHeartRateData(): LiveHeartRatePacket | null {
    if (!this.isConnected()) {
      return null;
    }

    // Return realistic BPM packet
    return {
      bpm: 72,
      restingBpm: 64,
      avgBpm: 74,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: this.connectedWearable?.name || 'Wearable Device',
    };
  }

  /**
   * Simulates step counter delta from pedometer sensor or connected health service
   */
  public syncStepsDelta(currentSteps: number): number {
    return currentSteps + Math.floor(Math.random() * 50) + 10;
  }
}

export const healthDeviceService = new HealthDeviceService();
