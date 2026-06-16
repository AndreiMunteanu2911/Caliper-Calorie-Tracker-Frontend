import { Capacitor } from '@capacitor/core';

export function isNativeCapacitor() {
  return Capacitor.isNativePlatform();
}
